export function isValidJSON(str: string) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

export function flatten(arr: Array<any>) {
  return arr.flat(1);
}

export function unleadingSlashIt(src: string): string {
  return src[0] === '/' ? src.slice(1) : src;
}

export function untrailingSlashIt(src: string): string {
  return src.replace(/\/$/, '');
}

export function isAbsoluteUrl(url: string) {
  return /^(?:[a-z]+:)?\/\//i.test(url);
}

export function absolutizeUrl(url: string) {
  if (!isAbsoluteUrl(url)) {
    const host =
      process.env.NEXT_PUBLIC_URL || process.env.NEXT_PUBLIC_VERCEL_URL || '';
    const hostWithHttp = host.startsWith('http') ? host : `https://${host}`;
    return `${untrailingSlashIt(hostWithHttp)}/${url}`;
  }

  return url;
}

export function formatDate(date: string, ignoreSameYear?: boolean) {
  const dateObject = new Date(date);
  const options =
    ignoreSameYear && new Date().getFullYear() === dateObject.getFullYear()
      ? ({ month: 'short', day: 'numeric' } as const)
      : ({ year: 'numeric', month: 'short', day: 'numeric' } as const);
  return dateObject.toLocaleDateString('en-US', options);
}

export function getWordTimeInSeconds(time: { seconds: string; nanos: number }) {
  const { seconds, nanos } = time;
  return typeof seconds !== 'undefined' && typeof nanos !== 'undefined'
    ? parseFloat(`${seconds}.${nanos.toString()}`)
    : 0;
}

export async function fileToBase64(file: Blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => resolve(e.target?.result);
    reader.readAsDataURL(file);
  });
}

export function encodeFormData(data: { [key: string]: any }) {
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    if (data[key] && data[key] instanceof FileList) {
      for (const file of data[key]) {
        formData.append(key, file, file.name);
      }
    } else {
      formData.append(key, data[key]);
    }
  });
  return formData;
}

export async function uploadFile(fileList: FileList) {
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: encodeFormData({ fileList }),
  });

  const json = await response.json();
  return json;
}

export function getFileName(url: string, keepExtension?: boolean) {
  if (keepExtension) {
    return url.substring(url.lastIndexOf('/') + 1);
  }
  return url.substring(url.lastIndexOf('/') + 1, url.lastIndexOf('.'));
}

export const shallowCompare = (
  obj1: { [key: string]: any },
  obj2: { [key: string]: any }
) =>
  Object.keys(obj1).length === Object.keys(obj2).length &&
  Object.keys(obj1).every((key) => key in obj2 && obj1[key] === obj2[key]);
