// Recidiviz - a data platform for criminal justice reform
// Copyright (C) 2022 Recidiviz, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
// =============================================================================
import { animation, palette } from "@recidiviz/design-system";
import { observer } from "mobx-react-lite";
import { transparentize } from "polished";
import * as React from "react";
import { MutableRefObject, useRef } from "react";
import AutosizeInput from "react-input-autosize";
import styled from "styled-components/macro";

import { useRootStore } from "../../../../components/StoreProvider";
import { Client, EarlyTerminationDraftData } from "../../../../WorkflowsStore";
import { useAnimatedValue, useReactiveInput } from "../../utils";
import { updateEarlyTerminationDraftFieldData } from "./utils";

interface FormInputWrapperProps {
  name: Extract<keyof EarlyTerminationDraftData, string>;
  placeholder?: string;
  style?: React.InputHTMLAttributes<HTMLInputElement>["style"];
}

interface FormInputProps extends FormInputWrapperProps {
  client: Client;
}

const StyledAutosizeInput = styled.span`
  input {
    display: inline-block;
    min-height: 1.1em;
    background-color: ${transparentize(0.9, palette.signal.highlight)};
    border-width: 0;
    border-bottom: 1px solid ${palette.signal.links};
    color: black;
    position: relative;
    max-width: 515px;
    background-color: ${transparentize(0.9, palette.signal.highlight)};
    transition: background-color ease-in ${animation.defaultDurationMs}ms;

    &:disabled {
      background-color: ${palette.slate10};
      border-bottom-color: ${palette.slate20};
      cursor: not-allowed;
    }

    &:hover,
    &:focus {
      background-color: ${transparentize(0.7, palette.signal.highlight)};
    }

    &::placeholder {
      color: ${palette.slate85};
    }
  }
`;

const FormInput: React.FC<FormInputProps> = observer(
  ({ client, name, style, ...props }: FormInputProps) => {
    const { earlyTermination } = client.opportunities;
    /*
   On mount, the autosize input has its value set, which causes it to resize to fit its content. During animation,
   we modify the element's value attribute in place which does not trigger resize.
   */
    const [value, onChange] = useReactiveInput<HTMLInputElement>({
      name,
      fetchFromStore: () => earlyTermination?.formData[name] as string,
      persistToStore: (valueToStore: string) =>
        earlyTermination?.setDataField(name, valueToStore),
      persistToFirestore: (valueToStore: string) =>
        updateEarlyTerminationDraftFieldData(client, name, valueToStore),
    });

    const inputRef = useRef<HTMLInputElement>(
      null
    ) as MutableRefObject<HTMLInputElement>;

    const setInputRef = React.useCallback(
      (inputElement: HTMLInputElement | null) => {
        if (inputElement) {
          inputRef.current = inputElement;
        }
      },
      []
    );

    useAnimatedValue(inputRef, value);

    return (
      <StyledAutosizeInput>
        <AutosizeInput
          inputRef={setInputRef}
          value={value}
          onChange={onChange}
          name={name}
          {...props}
        />
      </StyledAutosizeInput>
    );
  }
);

const FormInputWrapper: React.FC<FormInputWrapperProps> = ({
  ...props
}: FormInputWrapperProps) => {
  const { workflowsStore } = useRootStore();

  if (!workflowsStore?.selectedClient?.opportunityUpdates.earlyTermination) {
    return (
      <StyledAutosizeInput>
        <input {...props} disabled />
      </StyledAutosizeInput>
    );
  }

  return <FormInput client={workflowsStore.selectedClient} {...props} />;
};

export default observer(FormInputWrapper);
