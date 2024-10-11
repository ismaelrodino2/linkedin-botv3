import { MenuIcon } from "lucide-react";
import "./navbar.css"

export function NavBar() {
  return (
    <div className="container">
    <nav className="navbar">
      <MenuIcon size={48} />
      <div className="menu-content">
        <div className="image-wrapper">
          <img
            src="https://s3-alpha-sig.figma.com/img/2d2e/5d0a/6be4e27f17c41b46c8b0f59ac925e757?Expires=1728864000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=YYrrVEew8QW1iFQT1~R9EEh30DpKLq3C2tDrtvft9dc~PntQ-y6SHAKqghED6yje4Yrr4IWXq1N3OTJiPvaygSvw~qa9eBz~FC6VUyZKeOuF19k1T7mUP0iKJkc2gySk7r3zh9Q-nKS42aSIXZYUWo2iKTv9Ff5OOAtHW-G8kRP2Vnpf6qzuJL9j6KJO15gtZgE1bAVSWO4n2zSm5D0Vam5ahFI-iIJs8oLHOJ~-4Va15JrxAwxjZ3Uel7gflELEyR~b0DDfN~pCEABN7ZEd4dvO~XDpIQ2TUvSG8~usN0JASn6w9bveC~fcssCM9JeNcn0s4ye3l3ZEonVzrseU3w__"
            alt=""
            className="profile-image"
          />
        </div>
      </div>
    </nav>
  </div>
  
  );
}
