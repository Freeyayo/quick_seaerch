import React, { useEffect, useState } from 'react';
import { DisplayPathname } from './DisplayPathname';
import { navigatorMaps } from '@neon/navigator';
import { iterateMaps, decoratePathNameResolver } from '../resolvers';
import { Input } from 'antd';
import { MenuItemInfo } from '../interface/interfaces';
import { useDispatch } from '@neon/hooks';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';
import styles from '../index.less';

const ROW_HEIGHT = 53;
const MAX_INPUT_LENGTH = 15;
const MAX_ITEMS_LISTED_ONCE = 8;
const ROOT_URL = '/';
const QUICK_SEARCH_ITEM_TAG = '>';
const INPUT_PLACEHOLDER = '菜单快捷搜索';

/**
 * 菜单快速搜索框
 */
const QuickSearch = (props: any) => {
  const { permissions: userPermissions } = props;
  /**搜索结果 */
  const [searchResult, setSearchResult] = useState<MenuItemInfo[]>([]);
  /**用户输入的关键字 */
  const [keywords, setKeywords] = useState<string>('');
  /**结果展示框是否显示 */
  const [visible, toggle] = useState<boolean>(false);
  /**搜索结果 */
  const [itemsListed, setItemsListed] = useState<number>(0);
  const dispatch = useDispatch();
  const input = iterateMaps(navigatorMaps);
  /**
   * 根据用户的输入，进行数据计算。
   * 不需要进行节流：已过滤掉小写英文、数字操作
   */
  const inputChangeHandler = (event: any) => {
    const keywords = event.target.value;
    let filteredItems = input(keywords);
    if (!visible) {
      toggle(true);
    }
    /**权限过滤 */
    if (filteredItems.length > 0 && userPermissions[0] !== '*') {
      filteredItems = filteredItems.filter(item => {
        const { permissions = [] } = item;
        const permission = permissions[0];
        if (permission === undefined) {
          return true;
        }
        const hasPermission = Array.isArray(permissions)
          ? permission === '*' || userPermissions.includes(permission)
          : false;
        return hasPermission;
      });
    }
    setKeywords(keywords);
    setSearchResult(filteredItems);
  };

  /**处理结果展示框矢焦 */
  const globalClickHandler = event => {
    const text = event.target.innerText ?? '';
    if (!text.match(RegExp(QUICK_SEARCH_ITEM_TAG))) {
      toggle(false);
    }
  };
  useEffect(() => {
    window.addEventListener('click', globalClickHandler);
    return () => {
      window.removeEventListener('click', globalClickHandler);
    };
  }, []);

  /**展示结果数量发生变化时，展示框高度适配 */
  useEffect(() => {
    const resultsLength = searchResult.length;
    const displayItems = resultsLength > MAX_ITEMS_LISTED_ONCE ? MAX_ITEMS_LISTED_ONCE : resultsLength;
    setItemsListed(displayItems);
  }, [searchResult.length]);

  return (
    <div className={styles.container}>
      <Input
        className={styles.input}
        maxLength={MAX_INPUT_LENGTH}
        placeholder={INPUT_PLACEHOLDER}
        onChange={inputChangeHandler}
        value={keywords}
      />
      {searchResult.length > 0 && visible && (
        <div
          className={styles.list}
          style={{
            height: `${itemsListed * ROW_HEIGHT}px`,
            overflowY: 'scroll',
          }}
        >
          {searchResult.map(item => {
            const { name, path } = item;
            return (
              <div
                key={name}
                className={styles.item}
                onClick={() => {
                  setKeywords(name);
                  dispatch(routerRedux.push(ROOT_URL));
                  dispatch(routerRedux.replace(path));
                }}
              >
                <DisplayPathname
                  decoratedPathNameIndexes={decoratePathNameResolver(name, keywords)}
                  pathname={name}
                  keywords={keywords}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default connect(state => ({
  permissions: state.user.currentUser.permissions ?? [],
}))(QuickSearch);
