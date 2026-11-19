"""
Yogi_PLY - Python Integration Test Suite
Created By Shiv Yogi
"""

import os
import unittest
import tempfile
import shutil

# Test Range Request logic
class TestPythonServerLogic(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        self.sample_video = os.path.join(self.test_dir, 'sample.mp4')
        # Create a dummy 100KB file
        with open(self.sample_video, 'wb') as f:
            f.write(b'X' * 102400)

    def tearDown(self):
        shutil.rmtree(self.test_dir)

    def test_range_calculation(self):
        file_size = os.path.getsize(self.sample_video)
        self.assertEqual(file_size, 102400)

        # Range bytes 0-1023
        byte1, byte2 = 0, 1023
        length = byte2 - byte1 + 1
        self.assertEqual(length, 1024)

        with open(self.sample_video, 'rb') as f:
            f.seek(byte1)
            chunk = f.read(length)
        self.assertEqual(len(chunk), 1024)

    def test_anti_directory_traversal(self):
        safe_base = os.path.abspath(self.test_dir)
        attack_path = os.path.normpath(os.path.join(safe_base, '../etc/passwd'))
        self.assertFalse(attack_path.startswith(safe_base))

if __name__ == '__main__':
    unittest.main()
