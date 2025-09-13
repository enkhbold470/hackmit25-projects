import Image from "next/image";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
        <Image
          className="dark:invert"
          src="/base.jpg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
    </div>
  );
}
