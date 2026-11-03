"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";

export function ScreenshotGallery({
  images,
  altPrefix,
  closeLabel,
}: {
  images: string[];
  altPrefix: string;
  closeLabel: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [openIndex, setOpenIndex] = useState(0);
  const altFor = (index: number) => `${altPrefix} ${index + 1}`;

  // Routes stay mounted but hidden after navigation, so close the dialog when hidden.
  useLayoutEffect(() => {
    const element = dialog.current;
    return () => element?.close();
  }, []);

  return (
    <>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {images.slice(0, 3).map((src, index) => (
          <button
            key={src}
            type="button"
            aria-label={altFor(index)}
            onClick={() => {
              setOpenIndex(index);
              dialog.current?.showModal();
            }}
            className="relative aspect-16/10 cursor-zoom-in overflow-hidden rounded-lg"
          >
            <Image
              src={src}
              alt=""
              fill
              sizes="(min-width: 1024px) 130px, 33vw"
              className="object-cover object-top grayscale transition duration-300 ease-out group-hover:grayscale-0 group-data-[selected=true]:grayscale-0"
            />
          </button>
        ))}
      </div>
      <dialog
        ref={dialog}
        className="m-auto max-w-[90vw] rounded-2xl border border-border bg-surface p-4 text-text backdrop:bg-bg/80"
      >
        <button
          type="button"
          onClick={() => dialog.current?.close()}
          className="btn btn-outline btn-sm mb-4"
        >
          {closeLabel}
        </button>
        <Image
          src={images[openIndex]}
          alt={altFor(openIndex)}
          width={1600}
          height={1000}
          sizes="90vw"
          className="h-auto max-h-[75vh] w-auto rounded-lg"
        />
      </dialog>
    </>
  );
}
