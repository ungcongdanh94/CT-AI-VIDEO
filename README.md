# CT AI VIDEO

Một trang duy nhất. Tải ảnh/video cửa nhôm, kính, sắt của CÔNG THẢNH lên, chọn sản phẩm và phong cách, AI tự động viết script, tạo giọng đọc, và dựng thành một video quảng cáo dọc (9:16) hoàn chỉnh — kèm caption, hashtag và thumbnail sẵn để đăng Facebook/TikTok.

Không có đăng nhập. Không có dashboard. Không có CRM. Chỉ một nút: **Tạo video ngay**.

## Luồng xử lý (workflow)

```
Upload files
  -> Upload to Cloudinary                (app/api/upload)
  -> AI analyzes uploaded images         (lib/openai.ts -> analyzeImages)
  -> Generate script                     (lib/openai.ts -> generateScriptBundle)
  -> Generate caption + hashtags + CTA   (same call, structured JSON)
  -> Generate TTS voiceover              (lib/tts.ts)
  -> FFmpeg assemble (Ken Burns + mux)   (lib/ffmpeg.ts)
  -> Output files                        (public/outputs/<jobId>/...)
```

The whole thing after upload runs as one background job (`lib/pipeline.ts`), tracked by a single `Job` row in Postgres. `/api/generate` returns a `jobId` immediately; the browser polls `/api/status/[jobId]` every 2.5s to drive the progress list and reveal the download links once `status === "COMPLETED"`.

## Cấu trúc thư mục

```
app/
  page.tsx                        # the one page
  api/upload/route.ts             # multipart -> Cloudinary
  api/generate/route.ts           # creates the Job, fires the pipeline
  api/status/[jobId]/route.ts     # polled for progress
  api/download/[jobId]/[file]/route.ts  # streams finished files
components/
  UploadBox.tsx
  GenerateButton.tsx
  Progress.tsx
  VideoPreview.tsx
  ui/ (button, select, card)
lib/
  openai.ts       # vision analysis + script/caption/hashtag generation
  tts.ts          # OpenAI text-to-speech voiceover
  cloudinary.ts   # asset upload
  ffmpeg.ts       # Ken Burns render + concat + mux + thumbnail
  prompt.ts       # Vietnamese prompt builders
  pipeline.ts     # orchestrates the steps above, updates the Job row
  db.ts           # Prisma client singleton
  utils.ts
prisma/schema.prisma              # single Job model - no other tables
```

## Chạy local

Yêu cầu: Node.js 20+, PostgreSQL, và **ffmpeg + ffprobe đã cài trên máy** (`brew install ffmpeg` hoặc `apt install ffmpeg`).

```bash
cp .env.example .env
# điền DATABASE_URL, OPENAI_API_KEY, CLOUDINARY_*

npm install
npm run db:push
npm run dev
```

Mở http://localhost:3000.

## Biến môi trường

Xem `.env.example`. Ba nhóm bắt buộc:

- `DATABASE_URL` — Postgres (Railway's Postgres plugin sets this for you automatically when attached to the service).
- `OPENAI_API_KEY`, `OPENAI_TEXT_MODEL`, `OPENAI_TTS_MODEL`, `OPENAI_TTS_VOICE` — model names are env-configurable so you can point them at whatever multimodal/TTS model your account currently has access to.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

## Deploy lên Railway

1. Push repo này lên GitHub, tạo project mới trên Railway từ repo đó — Railway sẽ tự phát hiện `Dockerfile`.
2. Add a PostgreSQL plugin to the project; Railway injects `DATABASE_URL` automatically.
3. Set the OpenAI + Cloudinary env vars above in the service's Variables tab.
4. Deploy. The container installs `ffmpeg` via apt (see `Dockerfile`), runs `prisma db push` on boot, then starts the Next.js server.

Because the pipeline runs as a background task inside a long-lived Node process (not a serverless function), it survives past the HTTP request/response cycle — this is exactly the kind of workload Railway's always-on containers are built for, as opposed to a timeout-limited serverless deploy.

## Lưu ý về lưu trữ file đầu ra

Final files (`video.mp4`, `thumbnail.png`, `script.txt`, `caption.txt`, `hashtags.txt`, `voice.mp3`) are written to `public/outputs/<jobId>/` on the container's local disk and streamed back through `/api/download/[jobId]/[file]`. This keeps the MVP simple (no second cloud storage integration for outputs), but it does mean files won't survive a redeploy/restart on Railway's ephemeral filesystem — if you need outputs to persist long-term, mount a Railway volume at `public/outputs` or push the finished files to Cloudinary the same way the uploads are handled.

## Giới hạn có chủ đích (theo yêu cầu)

Không có: authentication, multi-user, payments, CRM, dashboard, inventory, analytics, admin panel, email. Đúng như brief: "Less is More."
