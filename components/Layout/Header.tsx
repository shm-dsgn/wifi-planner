import Image from "next/image";

const Header: React.FC = () => {
    return (
      <header className=" border-b-2 w-full">
        <div className="p-4 text-center mb-2">
          <div className="text-2xl font-medium flex flex-row w-full justify-center items-center gap-2">
            <Image src="/favicon.ico" alt="Nest Logo" width={24} height={24} /> 
            Nest*
            </div>
          <p className="text-gray-500 text-sm">
            Design/Upload your floor plan and find the best spot for your Wi-Fi router.
          </p>
        </div>
      </header>
    );
  };
  
  export default Header;
  