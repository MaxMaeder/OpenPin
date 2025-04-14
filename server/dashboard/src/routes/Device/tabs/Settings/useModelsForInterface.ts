import { ComboboxData } from "@mantine/core";
import { useMemo } from "react";
import {
  getModelsForInterface,
  LANGUAGE_MODELS,
  ModelInterfaces,
} from "src/assets/languageModels";

export const useModelsForInterface = (
  interfaces: ModelInterfaces
): ComboboxData => {
  return useMemo(() => {
    const enabledKeys = getModelsForInterface(interfaces);

    return LANGUAGE_MODELS.map((model) => {
      if (enabledKeys.includes(model.value)) {
        return model;
      } else {
        return { ...model, disabled: true };
      }
    });
  }, [interfaces]);
};
