import { Instagram, Linkedin, Youtube } from "lucide-react";
import { XLogo } from "../components/icons";

export const SOCIALS = [
  { label: "YouTube", href: "https://www.youtube.com/@EngineeringinKannada", icon: Youtube },
  { label: "Instagram", href: "https://www.instagram.com/engineering_in_kannada/", icon: Instagram },
  { label: "X (Twitter)", href: "https://twitter.com/chandansgowdru", icon: XLogo },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/chandan-s-gowda-4b2913183/",
    icon: Linkedin,
  },
] as const;

export const YOUTUBE_CHANNEL = SOCIALS[0].href;
