import cv2
import os

video_path = os.path.join('material', 'Vertical_continuous_shot_Top.mp4')
output_dir = os.path.join('public', 'frames')

os.makedirs(output_dir, exist_ok=True)

cap = cv2.VideoCapture(video_path)
if not cap.isOpened():
    print(f"Error: Unable to open video {video_path}")
    exit(1)

total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
fps = cap.get(cv2.CAP_PROP_FPS)
print(f"Video total frames: {total_frames}, FPS: {fps}")

# We target around 120-150 frames for smooth scroll scrubbing without huge download size
target_count = 120
step = max(1, total_frames // target_count)

saved_count = 0
frame_idx = 0

while True:
    ret, frame = cap.read()
    if not ret:
        break

    if frame_idx % step == 0:
        saved_count += 1
        filename = f"frame_{saved_count:04d}.jpg"
        out_path = os.path.join(output_dir, filename)
        # Save as optimized JPEG (quality 85)
        cv2.imwrite(out_path, frame, [int(cv2.IMWRITE_JPEG_QUALITY), 85])

    frame_idx += 1

cap.release()
print(f"Successfully extracted {saved_count} frames to {output_dir}")
