import cv2
import os
import sys

def extract_frames(video_path, output_dir, target_count=120, quality=85):
    """
    Extracts evenly spaced JPEG frames from a video file for canvas scroll scrubbing.
    """
    if not os.path.exists(video_path):
        print(f"Error: Video file '{video_path}' not found.")
        sys.exit(1)

    os.makedirs(output_dir, exist_ok=True)
    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        print(f"Error: Unable to open video '{video_path}'")
        sys.exit(1)

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    print(f"Video Info -> Total Frames: {total_frames}, FPS: {fps}")

    step = max(1, total_frames // target_count)
    saved_count = 0
    frame_idx = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if frame_idx % step == 0 and saved_count < target_count:
            saved_count += 1
            filename = f"frame_{saved_count:04d}.jpg"
            out_path = os.path.join(output_dir, filename)
            cv2.imwrite(out_path, frame, [int(cv2.IMWRITE_JPEG_QUALITY), quality])

        frame_idx += 1

    cap.release()
    print(f"Successfully extracted {saved_count} frames into '{output_dir}'.")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python extract_frames.py <input_video.mp4> <output_directory>")
        sys.exit(1)

    v_path = sys.argv[1]
    out_dir = sys.argv[2]
    extract_frames(v_path, out_dir)
