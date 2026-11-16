import * as React from "react";

import { cn } from "@/lib/utils";

// Pehchaan input: the system's field control (see .pk-input in globals.css).
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn("pk-input", className)}
      {...props}
    />
  );
}

export { Input };
