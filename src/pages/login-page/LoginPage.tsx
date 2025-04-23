import login_image from "../../assets/login_image.png";
import logo from "../../assets/logo.png";
import LoginForm from "./components/LoginForm";

const LoginPage = () => {
  return (
    <>
      <div className="flex h-screen">
        <div className="w-4/7 h-full shadow-lg overflow-hidden hidden md:block">
          <img src={login_image} className="w-full h-full object-cover" />
        </div>

        <div className="flex-1 flex flex-col items-center m-4 pt-10">
          <img src={logo} className="h-[109px] w-[99px]" />
          <h1 className="w-[100px] h-[38px] font-bold text-3xl mb-8">
            Sign In
          </h1>
          <LoginForm />
        </div>
      </div>
    </>
  );
};

export default LoginPage;
