"""Build the portable OAuth plugin, source bundle, or a separate private app binding."""
from pathlib import Path
import argparse
import hashlib
import json
import os
import re
import tempfile
import zipfile

ROOT = Path(__file__).resolve().parents[1]
PLUGIN = ROOT / "plugins" / "buyercaddy"
ENDPOINT = "https://buyercaddy-oauth-gateway-972736928837.us-central1.run.app/mcp/openai"
INPUTS = ["plugin.json", "mcp.json", ".codex-plugin/plugin.json", ".mcp.json", "skills", "assets", "README.md", "INSTALL.md", "LICENSE"]
APP_ID = re.compile(r"(?:asdk_app_|connector_|templated_apps_)[A-Za-z0-9][A-Za-z0-9_-]*\Z")


def validate_app_id(value):
    if not value or not APP_ID.fullmatch(value) or re.search(r"example|placeholder|todo", value, re.I):
        raise ValueError("A verified registered app ID is required; it is not an API key.")
    return value


def is_link(path):
    return path.is_symlink() or (hasattr(path, "is_junction") and path.is_junction())


def read_files(base, paths):
    result = {}
    for relative in paths:
        source = base / relative
        if not source.exists() or is_link(source):
            raise ValueError(f"Missing or linked package input: {relative}")
        candidates = sorted(source.rglob("*")) if source.is_dir() else [source]
        for path in candidates:
            if is_link(path):
                raise ValueError("Links are not allowed in packages")
            parts = path.relative_to(base).parts
            if any(part in {"node_modules", "dist", ".verification", "__pycache__", ".git"} for part in parts):
                continue
            if not path.is_file():
                continue
            name = path.relative_to(base).as_posix()
            if any(part.startswith(".env") for part in parts) or path.suffix.lower() in {".log", ".pyc", ".pem", ".key"}:
                raise ValueError(f"Excluded package input: {name}")
            data = path.read_bytes()
            if re.search(rb"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----", data):
                raise ValueError("Private-key material is forbidden")
            result[name] = data
    return result


def encoded(value):
    return (json.dumps(value, indent=2) + "\n").encode()


def validate_public(files):
    manifest = json.loads(files["plugin.json"])
    compat = json.loads(files[".codex-plugin/plugin.json"])
    if manifest.get("$schema") != "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json" or manifest.get("name") != "buyercaddy":
        raise ValueError("Expected the portable BuyerCaddy manifest")
    if not re.fullmatch(r"\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?", manifest.get("version", "")):
        raise ValueError("Expected a semantic version")
    if ".app.json" in files:
        raise ValueError("Public uploads must not include app bindings")
    for value in [manifest, compat]:
        if value.get("apps") is not None or value.get("extensions", {}).get("com.openai", {}).get("apps") is not None:
            raise ValueError("Public uploads must not declare apps")
    ui = manifest["extensions"]["com.openai"]["interface"]
    if compat["interface"] != ui or any(compat[k] != manifest[k] for k in ["name", "version"]):
        raise ValueError("Compatibility metadata differs from portable metadata")
    if not 0 < len(ui["shortDescription"]) <= 30:
        raise ValueError("Subtitle must fit 30 characters")
    transport = json.loads(files["mcp.json"])
    expected = {"type": "streamable-http", "url": ENDPOINT}
    if transport != {"$schema": "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json", "mcpServers": {"buyercaddy": expected}}:
        raise ValueError("Expected only the approved OAuth endpoint and DCR configuration")
    if json.loads(files[".mcp.json"]) != {"mcpServers": {"buyercaddy": {"url": ENDPOINT}}}:
        raise ValueError("Legacy transport must contain only the OAuth URL")
    for field in ["logo", "composerIcon"]:
        name = ui[field].removeprefix("./")
        if name not in files:
            raise ValueError(f"Missing icon {name}")
    for name, data in files.items():
        if name.endswith(".json"):
            json.loads(data)


def plugin_files(mode="public", app_id=None):
    if mode not in {"public", "local", "cloud"}:
        raise ValueError("Unknown plugin mode")
    if mode == "cloud":
        validate_app_id(app_id)
    elif app_id:
        raise ValueError("An app ID belongs only to private cloud mode")
    files = read_files(PLUGIN, INPUTS)
    if (PLUGIN / ".app.json").exists():
        raise ValueError("Keep private app bindings outside the public source folder")
    validate_public(files)
    if mode == "cloud":
        manifest = json.loads(files["plugin.json"])
        compat = json.loads(files[".codex-plugin/plugin.json"])
        manifest["extensions"]["com.openai"]["apps"] = "./.app.json"
        compat.pop("mcpServers")
        compat["apps"] = "./.app.json"
        files.pop("mcp.json")
        files.pop(".mcp.json")
        files["plugin.json"] = encoded(manifest)
        files[".codex-plugin/plugin.json"] = encoded(compat)
        files[".app.json"] = encoded({"apps": {"buyercaddy": {"id": app_id}}})
    return files


def build(mode, output, app_id=None):
    if mode == "source":
        if app_id:
            raise ValueError("An app ID belongs only to private cloud mode")
        plugin_files()
        files = read_files(ROOT, [".agents/plugins/marketplace.json", "plugins", "docs", "scripts", "tests", "README.md", "package.json", "package-lock.json", ".gitignore"])
    else:
        files = plugin_files(mode, app_id)
    output = Path(output).resolve()
    if output.is_relative_to(PLUGIN.resolve()) or output.suffix.lower() != ".zip":
        raise ValueError("Output must be a .zip outside the installed plugin")
    output.parent.mkdir(parents=True, exist_ok=True)
    handle, temporary = tempfile.mkstemp(prefix=".buyercaddy-", suffix=".tmp", dir=output.parent)
    os.close(handle)
    try:
        with zipfile.ZipFile(temporary, "w", compression=zipfile.ZIP_DEFLATED) as archive:
            for name, content in sorted(files.items()):
                entry = zipfile.ZipInfo(name, date_time=(2026, 1, 1, 0, 0, 0))
                entry.compress_type = zipfile.ZIP_DEFLATED
                archive.writestr(entry, content)
        with zipfile.ZipFile(temporary) as archive:
            if archive.testzip() is not None:
                raise ValueError("ZIP integrity check failed")
        os.replace(temporary, output)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)
    return hashlib.sha256(output.read_bytes()).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--mode", default="public", choices=["public", "local", "cloud", "source"])
    parser.add_argument("--app-id", help="Verified app ID for a private binding only")
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    suffix = "source" if args.mode == "source" else "private" if args.mode == "cloud" else "plugin"
    output = args.output or ROOT / "dist" / f"buyercaddy-chatgpt-{suffix}.zip"
    try:
        digest = build(args.mode, output, args.app_id)
    except (ValueError, OSError) as error:
        parser.error(str(error))
    print(f"{output}\nSHA256 {digest}")


if __name__ == "__main__":
    main()
