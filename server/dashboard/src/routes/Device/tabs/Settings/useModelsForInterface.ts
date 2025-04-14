import { ComboboxData } from "@mantine/core";
import { useMemo } from "react";
import { getModelsForInterface, languageModels, ModelInterfaces } from "src/assets/languageModels";

export const useModelsForInterface = (interfaces: ModelInterfaces): ComboboxData => {
  return useMemo(() => {
    const enabledKeys = getModelsForInterface(interfaces);

    return languageModels.map((model) => {
      if (enabledKeys.includes(model.value)) {
        return model;
      } else {
        return { ...model, disabled: true };
      }
    });
  }, [interfaces]);
};
