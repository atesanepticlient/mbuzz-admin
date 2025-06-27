import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

const Page = () => {
  return (
    <div>
      <div
        style={{ width: "100%", height: "100vh" }}
        className="flex items-center justify-center"
      >
        <Link href="https://app.chatwoot.com/app/accounts/122869/inbox-view">
          <Button variant={"primary"}>View Chat</Button>
        </Link>
      </div>
    </div>
  );
};

export default Page;
