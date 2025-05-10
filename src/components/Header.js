import Image from 'next/image';

const Header = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Image
              src="/icon_new.svg"
              alt="TalkPick Logo"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <div className="text-2xl font-bold text-black">
              TalkPick
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 