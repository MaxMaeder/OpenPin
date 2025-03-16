import {
  Box,
  Combobox,
  Input,
  InputBase,
  Text,
  useCombobox,
} from "@mantine/core";

import parseFirmwareNames from "./parseFirmwareNames";

interface OptionProps {
  fileName: string;
  uploadDate: string;
}

const FileOption = ({ fileName, uploadDate }: OptionProps) => {
  return (
    <Box>
      <Text fz="sm" fw={500}>
        {fileName}
      </Text>
      <Text fz="xs" opacity={0.6}>
        {uploadDate}
      </Text>
    </Box>
  );
};

interface FileSelectorProps {
  disabled: boolean;
  data: string[];
  value?: string | null;
  onChange: (v: string) => void;
}

const FileSelector = ({
  disabled,
  data,
  value,
  onChange,
}: FileSelectorProps) => {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const fileNames = parseFirmwareNames(data);

  const selectedOption = fileNames.find((item) => item.value === value);

  const options = fileNames.map((item) => (
    <Combobox.Option value={item.value} key={item.value}>
      <FileOption {...item} />
    </Combobox.Option>
  ));

  return (
    <Combobox
      disabled={disabled}
      store={combobox}
      withinPortal={false}
      onOptionSubmit={(val) => {
        onChange(val);
        combobox.closeDropdown();
      }}
    >
      <Combobox.Target>
        <InputBase
          disabled={disabled}
          w={300}
          component="button"
          type="button"
          pointer
          rightSection={<Combobox.Chevron />}
          onClick={() => combobox.toggleDropdown()}
          rightSectionPointerEvents="none"
          multiline
        >
          {selectedOption ? (
            <FileOption {...selectedOption} />
          ) : (
            <Input.Placeholder>Select...</Input.Placeholder>
          )}
        </InputBase>
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options mah={150} style={{ overflowY: "auto" }}>
          {options.length > 0 ? (
            options
          ) : (
            <Combobox.Empty>No files</Combobox.Empty>
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
};

export default FileSelector;
