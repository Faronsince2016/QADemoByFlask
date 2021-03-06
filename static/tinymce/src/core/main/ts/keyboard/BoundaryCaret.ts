/**
 * BoundaryCaret.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Option } from '@ephox/katamari';
import CaretContainer from '../caret/CaretContainer';
import CaretContainerInline from '../caret/CaretContainerInline';
import CaretContainerRemove from '../caret/CaretContainerRemove';
import CaretFinder from '../caret/CaretFinder';
import CaretPosition from '../caret/CaretPosition';
import NodeType from '../dom/NodeType';

const insertInlinePos = function (pos, before) {
  if (NodeType.isText(pos.container())) {
    return CaretContainerInline.insertInline(before, pos.container());
  } else {
    return CaretContainerInline.insertInline(before, pos.getNode());
  }
};

const isPosCaretContainer = function (pos, caret) {
  const caretNode = caret.get();
  return caretNode && pos.container() === caretNode && CaretContainer.isCaretContainerInline(caretNode);
};

const renderCaret = function (caret, location) {
  return location.fold(
    function (element) { // Before
      CaretContainerRemove.remove(caret.get());
      const text = CaretContainerInline.insertInlineBefore(element);
      caret.set(text);
      return Option.some(new CaretPosition(text, text.length - 1));
    },
    function (element) { // Start
      return CaretFinder.firstPositionIn(element).map(function (pos) {
        if (!isPosCaretContainer(pos, caret)) {
          CaretContainerRemove.remove(caret.get());
          const text = insertInlinePos(pos, true);
          caret.set(text);
          return new CaretPosition(text, 1);
        } else {
          return new CaretPosition(caret.get(), 1);
        }
      });
    },
    function (element) { // End
      return CaretFinder.lastPositionIn(element).map(function (pos) {
        if (!isPosCaretContainer(pos, caret)) {
          CaretContainerRemove.remove(caret.get());
          const text = insertInlinePos(pos, false);
          caret.set(text);
          return new CaretPosition(text, text.length - 1);
        } else {
          return new CaretPosition(caret.get(), caret.get().length - 1);
        }
      });
    },
    function (element) { // After
      CaretContainerRemove.remove(caret.get());
      const text = CaretContainerInline.insertInlineAfter(element);
      caret.set(text);
      return Option.some(new CaretPosition(text, 1));
    }
  );
};

export default {
  renderCaret
};