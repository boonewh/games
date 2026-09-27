"""Create a silent hero loop with a 12-frame eased end/start overlap."""
import subprocess
import sys
from collections import deque
from pathlib import Path
import numpy as np

ff, source, destination = sys.argv[1:]
width, height, fps, overlap = 1280, 720, 24, 12
size = width * height * 3 // 2
reader = subprocess.Popen([ff, '-v', 'error', '-i', source, '-f', 'rawvideo', '-pix_fmt', 'yuv420p', '-'], stdout=subprocess.PIPE)
writer = subprocess.Popen([ff, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'yuv420p', '-s', f'{width}x{height}', '-r', str(fps), '-i', '-', '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '12', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', destination], stdin=subprocess.PIPE)
head, tail = [], deque()
count = 0
while True:
    frame = reader.stdout.read(size)
    if not frame:
        break
    if len(frame) != size:
        raise RuntimeError('Incomplete decoded frame')
    count += 1
    if len(head) < overlap:
        head.append(frame)
    else:
        tail.append(frame)
        if len(tail) > overlap:
            writer.stdin.write(tail.popleft())
assert count > 2 * overlap
for n, (a, b) in enumerate(zip(tail, head)):
    t = n / (overlap - 1)
    weight = t * t * (3 - 2 * t)
    a = np.frombuffer(a, np.uint8).astype(np.float32)
    b = np.frombuffer(b, np.uint8).astype(np.float32)
    writer.stdin.write(np.rint(a * (1 - weight) + b * weight).clip(0, 255).astype(np.uint8).tobytes())
reader.stdout.close()
writer.stdin.close()
assert reader.wait() == 0
assert writer.wait() == 0
print(f'Created {count-overlap} frames; {(count-overlap)/fps:.2f} seconds')
