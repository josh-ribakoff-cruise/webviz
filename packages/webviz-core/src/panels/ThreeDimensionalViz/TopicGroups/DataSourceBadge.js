// @flow
//
//  Copyright (c) 2019-present, Cruise LLC
//
//  This source code is licensed under the Apache License, Version 2.0,
//  found in the LICENSE file in the root directory of this source tree.
//  You may not use this file except in compliance with the License.

import React from "react";
import styled from "styled-components";
import tinycolor from "tinycolor2";

import { DATA_SOURCE_BADGE_SIZE } from "./constants";
import KeyboardShortcut from "webviz-core/src/components/KeyboardShortcut";
import Tooltip from "webviz-core/src/components/Tooltip";
import { colors } from "webviz-core/src/util/sharedStyleConstants";

type StyleProps = {|
  visible: boolean,
  available: boolean,
  isParentVisible: boolean,
  isNamespace: ?boolean,
  highlighted: boolean,
  overrideColor: ?string,
|};

const SDataSourceBadgeWrapper = styled.span`
  display: inline-flex;
  width: ${DATA_SOURCE_BADGE_SIZE}px;
  height: ${(props: { isNamespace: ?boolean }) => (props.isNamespace ? "24px" : `${DATA_SOURCE_BADGE_SIZE}px`)};
  align-items: center;
  justify-content: center;
  /* disallow selection to prevent shift + click from accidentally select */
  user-select: none;
`;

const STooltipRow = styled.div`
  padding: 4px 0;
  max-width: 400px;
  display: flex;
  justify-content: space-between;
`;
const TOPIC_SIZE = 12;
const NAMESPACE_SIZE = 10;
const HOVER_TOPIC_SIZE = 22;
const HOVER_NAMESPACE_SIZE = 16;
const DEFAULT_COLOR = colors.LIGHT1;
const DISABLED_COLOR = tinycolor(colors.GRAY)
  .setAlpha(0.3)
  .toRgbString();

function getStyles({
  isParentVisible,
  isNamespace,
  highlighted,
  overrideColor,
  visible,
}: StyleProps): {|
  fontSize: number,
  width: number,
  height: number,
  borderRadius: number,
  color: string,
  backgroundColor: string,
  borderColor: string,
  cursor: string,
|} {
  let styles = {
    fontSize: isNamespace ? 8 : 10,
    width: TOPIC_SIZE,
    height: TOPIC_SIZE,
    borderRadius: TOPIC_SIZE / 2,
    color: "transparent",
    backgroundColor: visible ? overrideColor || DEFAULT_COLOR : "transparent",
    borderColor: isParentVisible ? overrideColor || DEFAULT_COLOR : DISABLED_COLOR,
    cursor: isParentVisible ? "pointer" : "not-allowed",
  };
  if (!isParentVisible) {
    styles = { ...styles, color: "transparent", backgroundColor: visible ? DISABLED_COLOR : "transparent" };
    styles.color = "transparent";
    if (isNamespace) {
      styles = { ...styles, width: NAMESPACE_SIZE, height: NAMESPACE_SIZE, borderRadius: NAMESPACE_SIZE / 2 };
    }
  } else if (highlighted) {
    if (isNamespace) {
      styles = {
        ...styles,
        width: HOVER_NAMESPACE_SIZE,
        height: HOVER_NAMESPACE_SIZE,
        borderRadius: HOVER_NAMESPACE_SIZE / 2,
        color: "transparent",
      };
    } else {
      styles = {
        ...styles,
        width: HOVER_TOPIC_SIZE,
        height: HOVER_TOPIC_SIZE,
        borderRadius: HOVER_TOPIC_SIZE / 2,
        // TODO(Audrey): auto compute text color based on overrideColor
        color: visible ? colors.DARK2 : colors.LIGHT,
      };
    }
  } else if (isNamespace) {
    styles = { ...styles, width: NAMESPACE_SIZE, height: NAMESPACE_SIZE };
  }
  return styles;
}

const SDataSourceBadge = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  border-width: 2px;
  border-style: solid;
`;

type Props = {|
  available: boolean,
  badgeText: string,
  dataTest: string,
  dataSourcePrefixes: string[],
  isTopicGroup?: boolean,
  isNamespace?: boolean,
  onToggleVisibility: () => void,
  onToggleAllVisibilities?: () => void,
  visible: boolean,
  isParentVisible: boolean,
  highlighted: boolean,
  overrideColor?: ?string,
  topicName?: string,
|};

export default function DataSourceBadge({
  badgeText,
  dataTest,
  dataSourcePrefixes,
  isTopicGroup,
  onToggleVisibility,
  onToggleAllVisibilities,
  topicName,
  ...rest
}: Props) {
  const tooltips = [];
  if (!rest.isNamespace) {
    tooltips.push(<KeyboardShortcut key="toggle-visibility" keys={["Enter"]} description="Toggle visibility" />);

    if (onToggleAllVisibilities) {
      tooltips.push(
        <KeyboardShortcut key="toggle children in column" keys={["Shift", "Enter"]} description="Toggle children" />
      );
      tooltips.push(
        <KeyboardShortcut
          key="toggle children"
          keys={["Shift", "Click"]}
          description="Toggle children in clicked column"
        />
      );
    }
    // show any non-empty prefixes in the tooltip
    if (dataSourcePrefixes.length && !(dataSourcePrefixes.length === 1 && dataSourcePrefixes[0] === "")) {
      const prefixesElems = dataSourcePrefixes.map((prefix, idx) =>
        prefix ? (
          <code key={prefix}>
            {prefix}
            {idx < dataSourcePrefixes.length - 1 ? "," : ""}
          </code>
        ) : null
      );
      tooltips.push(
        <STooltipRow key="prefix">
          {dataSourcePrefixes.length > 1 ? "Prefixes" : "Prefix"}: {prefixesElems}
        </STooltipRow>
      );
    }
  }

  const dataSourceBadgeEl = (
    <SDataSourceBadge {...rest} style={getStyles(rest)} data-test={dataTest}>
      {badgeText}
    </SDataSourceBadge>
  );

  return (
    <SDataSourceBadgeWrapper
      isNamespace={rest.isNamespace}
      onClick={(e) => {
        if (rest.isParentVisible) {
          // press shift key to toggle all
          if (onToggleAllVisibilities && e.shiftKey) {
            onToggleAllVisibilities();
          } else {
            onToggleVisibility();
          }
        }
      }}>
      {rest.available && (
        <>
          {tooltips.length ? (
            <Tooltip placement="top" contents={tooltips}>
              {dataSourceBadgeEl}
            </Tooltip>
          ) : (
            dataSourceBadgeEl
          )}
        </>
      )}
    </SDataSourceBadgeWrapper>
  );
}
