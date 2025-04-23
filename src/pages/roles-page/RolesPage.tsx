import { Button } from "antd";

const RolesPage = () => {
  return (
    <>
      <div className="flex justify-between items-center top-0 ml-6 mr-6 mb-4 mt-[15px] pt-0 pl-0">
        <h1 className="text-xl font-semibold">Roles Management</h1>
        <Button
          type="primary"
          style={{ height: "40px", backgroundColor: "#F97316" }}
          className="!font-semibold"
        >
          + Add New Role Admin
        </Button>
      </div>
      <div className="flex items-center justify-center">Roles Page</div>
    </>
  );
};

export default RolesPage;
