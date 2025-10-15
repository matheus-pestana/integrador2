import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      {...props}
    >
      <rect width="256" height="256" fill="none" />
      <path
        d="M128,24a104,104,0,1,0,104,104A104.11,104.11,0,0,0,128,24Zm-44,60a28,28,0,1,1-28,28,28,28,0,0,1,28-28Zm-8,84a24,24,0,1,1,24-24A24,24,0,0,1,76,168Zm52,28a40,40,0,1,1,40-40A40,40,0,0,1,128,196Zm52-84a20,20,0,1,1-20-20A20,20,0,0,1,180,112Z"
        opacity="0.2"
        className="text-primary"
      />
      <path
        d="M128,24a104,104,0,1,0,104,104A104.11,104.11,0,0,0,128,24Zm-44,60a28,28,0,1,1-28,28,28,28,0,0,1,28-28Zm-8,84a24,24,0,1,1,24-24A24,24,0,0,1,76,168Zm52,28a40,40,0,1,1,40-40A40,40,0,0,1,128,196Zm52-84a20,20,0,1,1-20-20A20,20,0,0,1,180,112Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="16"
      />
    </svg>
  );
}
