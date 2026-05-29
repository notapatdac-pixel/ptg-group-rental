export interface StoreImages {
  cover?: string;
  logo?: string;
  products?: string[];
}

const KEY = (name: string) => `ptg_store_images_${name}`;

export function getStoreImages(storeName: string): StoreImages {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY(storeName)) ?? "{}") as StoreImages;
  } catch {
    return {};
  }
}

export function setStoreImages(storeName: string, images: StoreImages): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY(storeName), JSON.stringify(images));
  } catch {}
}
