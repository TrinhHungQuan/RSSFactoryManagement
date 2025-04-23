import SettingsInput from "../../components/SettingsInput";

const SettingsPage = () => {
  return (
    <>
      <div className="top-0 ml-6 mr-6 mb-4 mt-[22px] pt-0 pl-0">
        <h1 className="text-xl font-semibold">Settings</h1>
      </div>

      <div className="border rounded border-gray-300 ml-6 mr-6">
        <div className="ml-6 mr-6 mt-[22px] pt-0 pl-0">
          <h1 className="font-semibold">Android App Time Out</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ml-6 mr-6 mb-4 mt-5">
          <SettingsInput label="Timeout (mins)" name="timeout" value="" />
          <SettingsInput
            label="Device"
            name="device"
            value="Android App"
            readOnly={true}
          />
        </div>
      </div>

      <div className="border rounded border-gray-300 ml-6 mr-6 mt-6">
        <div className="ml-6 mr-6 mt-[22px] pt-0 pl-0">
          <h1 className="font-semibold">Difficulty Level</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ml-6 mr-6 mb-4 mt-5">
          <SettingsInput label="Level 1" name="level1" value="" />
          <SettingsInput label="Level 2" name="level2" value="" />
          <SettingsInput label="Level 3" name="level3" value="" />
          <SettingsInput label="Level 4" name="level4" value="" />
          <SettingsInput label="Level 5" name="level5" value="" />
        </div>
      </div>

      <div className="border rounded border-gray-300 ml-6 mr-6 mt-6">
        <div className="flex flex-row items-center justify-between ml-6 mr-6 mt-[22px] pt-0 pl-0">
          <h1 className="font-semibold">Factory Jobs Display Setting</h1>
          <p className="text-[#FB923C] font-bold text-xs cursor-pointer">
            + Add more
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ml-6 mr-6 mb-4 mt-5">
          <SettingsInput label="Times (s)" name="time" value="" />
          <SettingsInput
            label="Device"
            name="device"
            value="Display Web App"
            readOnly={true}
          />
        </div>
      </div>
    </>
  );
};

export default SettingsPage;
