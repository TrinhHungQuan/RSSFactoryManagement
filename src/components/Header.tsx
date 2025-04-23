import { Button } from "antd";

interface HeaderProps {
  title: string;
  buttonChildren: string;
  onClick: () => void;
}

const Header = ({ title, buttonChildren, onClick }: HeaderProps) => {
  return (
    <>
      <div className="flex justify-between items-center top-0">
        <h1>{title}</h1>
        <Button
          type="primary"
          style={{ height: "40px" }}
          className="!font-semibold"
          onClick={onClick}
        >
          {buttonChildren}
        </Button>
      </div>
    </>
  );
};

export default Header;
