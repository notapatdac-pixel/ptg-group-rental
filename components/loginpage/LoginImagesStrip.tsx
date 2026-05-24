const images = [
  { src: "/image/login-retail-store.jpg", alt: "Retail store interior" },
  { src: "/image/login-analyst.jpg", alt: "Business analyst with data" },
  { src: "/image/login-buildings.jpg", alt: "Modern city buildings" },
];

export default function SignInImagesStrip() {
  return (
    <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto w-full px-4">
      {images.map((img) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={img.src}
          src={img.src}
          alt={img.alt}
          className="w-full h-40 object-cover rounded-xl"
        />
      ))}
    </div>
  );
}
