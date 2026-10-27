import importlib.util
import json
import os
import re
from pathlib import Path
import struct
import tempfile
import unittest
from unittest.mock import patch
import zipfile

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('package', ROOT / 'scripts/package.py')
package = importlib.util.module_from_spec(spec)
spec.loader.exec_module(package)


class PackageTests(unittest.TestCase):
    def test_public_oauth_and_legacy_configs_match(self):
        files = package.plugin_files()
        package.validate_public(files)
        self.assertEqual(package.plugin_files('local'), files)
        self.assertNotIn('.app.json', files)
        self.assertEqual(len(json.loads(files['skills/research/references/tools.json'])['tools']), 18)
        self.assertFalse(any(name.startswith('skills/credits/') for name in files))
        self.assertNotIn(b'BUYERCADDY_API_KEY', files['.mcp.json'])

    def test_private_binding_cannot_leak_into_public_build(self):
        for app_id in ['asdk_app_testfixture123', 'connector_testfixture123', 'templated_apps_testfixture123']:
            files = package.plugin_files('cloud', app_id)
            self.assertNotIn('.mcp.json', files)
            self.assertNotIn('mcp.json', files)
            self.assertEqual(json.loads(files['.app.json'])['apps']['buyercaddy']['id'], app_id)
            self.assertEqual(json.loads(files['plugin.json'])['extensions']['com.openai']['apps'], './.app.json')
            with self.assertRaises(ValueError):
                package.validate_public(files)
        self.assertNotIn('.app.json', package.plugin_files())

    def test_invalid_ids_fail_before_creating_output(self):
        for app_id in [None, '', 'plugin_asdk_app_abc', 'asdk_app_', 'asdk_app_example', 'connector_TODO', 'asdk_app_x/../y', 'asdk_app_x\n', 'api-key']:
            with self.subTest(app_id=app_id), tempfile.TemporaryDirectory() as tmp:
                target = Path(tmp) / 'plugin.zip'
                with self.assertRaises(ValueError):
                    package.build('cloud', target, app_id)
                self.assertFalse(target.exists())

    def test_secrets_and_header_overrides_fail_closed(self):
        original = package.plugin_files()
        for name in ['plugin.json', '.codex-plugin/plugin.json']:
            files = dict(original)
            manifest = json.loads(files[name])
            manifest['apps'] = './.app.json'
            files[name] = package.encoded(manifest)
            with self.assertRaises(ValueError):
                package.validate_public(files)
        for name in ['mcp.json', '.mcp.json']:
            files = dict(original)
            obj = json.loads(files[name])
            obj['mcpServers']['buyercaddy']['headers'] = {'X-Api-Key': 'TEST_SECRET'}
            files[name] = package.encoded(obj)
            with self.assertRaises(ValueError):
                package.validate_public(files)

    def test_atomic_repeatable_build_does_not_read_environment_secret(self):
        marker = 'TEST_ONLY_SECRET_DO_NOT_PACKAGE_48257'
        with tempfile.TemporaryDirectory() as tmp, patch.dict(os.environ, {'BUYERCADDY_API_KEY': marker}):
            path = Path(tmp) / 'plugin.zip'
            digest = package.build('public', path)
            self.assertEqual(digest, package.build('public', path))
            with zipfile.ZipFile(path) as archive:
                self.assertIsNone(archive.testzip())
                files = {n: archive.read(n) for n in archive.namelist()}
                package.validate_public(files)
                for data in files.values():
                    self.assertNotIn(marker.encode(), data)
            with patch.object(package.zipfile.ZipFile, 'writestr', side_effect=OSError('test write failure')):
                with self.assertRaises(OSError):
                    package.build('public', path)
            self.assertEqual(package.hashlib.sha256(path.read_bytes()).hexdigest(), digest)
            self.assertEqual(list(Path(tmp).glob('*.tmp')), [])

    def test_listing_icon_and_review_fields(self):
        files = package.plugin_files()
        manifest = json.loads(files['plugin.json'])
        ext = manifest['extensions']['com.openai']
        ui = ext['interface']
        self.assertLessEqual(len(ui['displayName']), 30)
        self.assertLessEqual(len(ui['shortDescription']), 30)
        self.assertLessEqual(len(ui['longDescription']), 4000)
        self.assertEqual(ui['category'], 'Business & Operations')
        for field in ['websiteURL', 'supportURL', 'privacyPolicyURL', 'termsOfServiceURL']:
            self.assertTrue(ui[field].startswith('https://buyercaddy.com/'))
        for field in ['logo', 'composerIcon']:
            png = files[ui[field].removeprefix('./')]
            self.assertEqual(png[:8], b'\x89PNG\r\n\x1a\n')
            width, height = struct.unpack('>II', png[16:24])
            self.assertEqual(width, height)
            self.assertGreaterEqual(width, 256)
            self.assertLessEqual(len(png), 5 * 1024 * 1024)
        cases = ext['review']['test_cases']
        self.assertEqual(len(cases['positive']), 5)
        self.assertEqual(len(cases['negative']), 3)
        for case in cases['positive']:
            for field in ['description', 'prompt', 'tools_triggered', 'expected_behavior']:
                self.assertIsInstance(case[field], str)
                self.assertTrue(case[field].strip())
        self.assertFalse(ext['review']['commerce'])
        # Preparation may omit these fields; completing a submission must not
        # break tests. Check supplied values without asserting readiness.
        if 'demo_recording_url' in ext['review']:
            self.assertTrue(ext['review']['demo_recording_url'].startswith('https://'))
        if 'countries' in ext['publication']:
            countries = ext['publication']['countries']
            self.assertIsInstance(countries, list)
            self.assertEqual(len(countries), len(set(countries)))
            self.assertTrue(all(isinstance(c, str) and re.fullmatch('[A-Z]{2}', c) for c in countries))

    def test_marketplace_and_source_archive_are_complete(self):
        catalog = json.loads((ROOT / '.agents/plugins/marketplace.json').read_text())
        entry = catalog['plugins'][0]
        self.assertEqual((ROOT / entry['source']['path']).resolve(), package.PLUGIN)
        self.assertEqual(entry['policy']['authentication'], 'ON_INSTALL')
        with tempfile.TemporaryDirectory() as tmp:
            target = Path(tmp) / 'source.zip'
            package.build('source', target)
            with zipfile.ZipFile(target) as archive:
                self.assertIsNone(archive.testzip())
                for name in ['.agents/plugins/marketplace.json', 'scripts/package.py', 'scripts/package.ps1', 'plugins/buyercaddy/plugin.json', 'docs/review-materials.md']:
                    self.assertIn(name, archive.namelist())
                self.assertFalse(any('__pycache__' in n or '.verification' in n or 'node_modules' in n for n in archive.namelist()))

    def test_secret_files_and_in_tree_output_are_rejected(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp)
            (path / '.env').write_text('TEST_ONLY')
            with self.assertRaises(ValueError):
                package.read_files(path, ['.env'])
        with self.assertRaises(ValueError):
            package.build('public', package.PLUGIN / 'bad.zip')


if __name__ == '__main__':
    unittest.main()
