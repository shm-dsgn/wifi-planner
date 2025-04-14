import React from "react";
import { GitBranchIcon } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-100 mt-auto">
      <div className="container mx-auto p-4 flex md:flex-row gap-2 justify-between items-center">
        <div className="flex flex-col gap-1 text-xs text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} WiFi Planner. All rights reserved.
          </p>
          <p>
            Built with ❤️ by{" "}
            <Link
              href="https://sohamdutta.in"
              target="_blank"
              className="text-blue-500 hover:underline"
              rel="noopener noreferrer"
            >
              Soham Dutta.
            </Link>
          </p>
        </div>
        <Button variant="outline" size={"sm"}>
          <Link
            href="https://github.com/shm-dsgn/router-ranger"
            target="_blank"
            className="flex items-center gap-2 text-xs"
          >
            <GitBranchIcon className="h-4 w-4" /> View on GitHub
          </Link>
        </Button>
      </div>
    </footer>
  );
};

export default Footer;
