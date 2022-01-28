import React from 'react';
import { DecoratedPathNameIndex } from '../interface/interfaces';

const MATCHED_WORDS_COLOR = 'yellow';

/**
 * 菜单快速搜索框的展示下拉部分
 */
export const DisplayPathname = (props: {
  decoratedPathNameIndexes: DecoratedPathNameIndex;
  pathname: string;
  keywords: string;
}) => {
  const { decoratedPathNameIndexes, pathname, keywords } = props;
  const slicedPathname: string[] = pathname.split('');
  const keywordsLength = keywords.length;
  /**标记匹配到的字符 */
  const blocks: boolean[] = new Array(slicedPathname.length);
  decoratedPathNameIndexes.forEach(dIndex => {
    for (let i = dIndex; i < dIndex + keywordsLength; i++) {
      blocks[i] = true;
    }
  });

  return (
    <span>
      {slicedPathname.map((word, index) => {
        const matched = blocks[index];
        return (
          <span key={index} style={{ background: matched ? MATCHED_WORDS_COLOR : '' }}>
            {word}
          </span>
        );
      })}
    </span>
  );
};
