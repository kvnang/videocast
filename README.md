# [Videocast](https://www.videocast.app)

> Turn your podcast into an engaging video, effortlessly.

## About the Project

Videocast is an open-source project. It allows general users to generate a video from their podcast snippets, and gives extensive control over the subtitles and styles of the video.

**The goal of this app is to automate, as much as possible, the video-generation workflow**, which can be time-consuming in itself.

### The Repository

- `/app`: a Next.js app (front end, APIs)
- `/worker`: a Cloudflare Worker (bindings for R2, KV storages)

### The Stack

- [Remotion](https://www.remotion.dev/): A Node package which allows generating video using React, leveraging tools such as Puppeteer and AWS Lambda.
- [Next.js](https://nextjs.org/): The React framework for the frontend of this app, and for the API routes to handle authentication + connections to other third-party APIs.
- [Cloudflare Workers®](https://workers.cloudflare.com/): A fast serverless code runner for various critical tasks:
  - **R2**: handles media file storage, automatically copy files from S3 to R2 (as Remotion uses S3 as storage by default).
  - **KV**: loads Google fonts on-demand using KV as cache
- [Google Speech-to-Text](https://cloud.google.com/speech-to-text/): Automatically transcribes podcast audio into text.
- [MongoDB](https://www.mongodb.com/): A database for storing user-saved projects and style templates.
- [Auth0](https://auth0.com/): Authentication manager.
