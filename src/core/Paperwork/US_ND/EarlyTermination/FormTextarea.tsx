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
import TextareaAutosize from "react-textarea-autosize";
import type { TextareaAutosizeProps } from "react-textarea-autosize/dist/declarations/src";
import styled from "styled-components/macro";

import { useRootStore } from "../../../../components/StoreProvider";
import { Client, EarlyTerminationDraftData } from "../../../../WorkflowsStore";
import { useAnimatedValue, useReactiveInput } from "../../utils";
import { updateEarlyTerminationDraftFieldData } from "./utils";

export const Textarea = styled(TextareaAutosize)`
  display: inline-block;
  box-sizing: content-box;
  border-width: 0;
  border-bottom: 1px solid ${palette.signal.links};
  color: black;
  font-family: "Times New Roman", serif;
  position: relative;
  width: 100%;
  background-color: ${transparentize(0.9, palette.signal.highlight)};
  transition: background-color ease-in ${animation.defaultDurationMs}ms;

  &:hover,
  &:focus {
    background-color: ${transparentize(0.7, palette.signal.highlight)};
  }

  &:disabled {
    background-color: ${palette.slate10};
    border-bottom-color: ${palette.slate20};
    cursor: not-allowed;
  }
`;

interface FormTextareaWrapperProps extends TextareaAutosizeProps {
  name: Extract<keyof EarlyTerminationDraftData, string>;
}

interface FormTextareaProps extends FormTextareaWrapperProps {
  client: Client;
}

const FormTextarea: React.FC<FormTextareaProps> = observer(
  ({ client, name, ...props }: FormTextareaProps) => {
    const { earlyTermination } = client.opportunities;
    const [value, onChange] = useReactiveInput<HTMLTextAreaElement>({
      name,
      fetchFromStore: () => earlyTermination?.formData[name] as string,
      persistToStore: (valueToStore: string) =>
        earlyTermination?.setDataField(name, valueToStore),
      persistToFirestore: (valueToStore: string) =>
        updateEarlyTerminationDraftFieldData(client, name, valueToStore),
    });

    const inputRef = useRef<HTMLTextAreaElement>(
      null
    ) as MutableRefObject<HTMLTextAreaElement>;

    // On mount, the autosize input has its value set, which causes it to resize to fit its content. During animation,
    // we modify the element's value attribute in place which does not trigger resize.
    useAnimatedValue(inputRef, value);

    return (
      <Textarea
        ref={inputRef}
        name={name}
        value={value}
        onChange={onChange}
        {...props}
      />
    );
  }
);

const FormTextareaWrapper = ({ name, ...props }: FormTextareaWrapperProps) => {
  const { workflowsStore } = useRootStore();

  if (!workflowsStore?.selectedClient?.opportunityUpdates.earlyTermination) {
    return <Textarea {...props} disabled />;
  }

  return (
    <FormTextarea
      client={workflowsStore.selectedClient}
      name={name}
      {...props}
    />
  );
};

export default observer(FormTextareaWrapper);
