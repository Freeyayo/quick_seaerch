/// <reference lib="es2020" />

import {
  DecoratedPathNameIndex,
  NavigatorTreeNode,
  TreeDataMap,
  NavTreeNode,
  MenuItemInfo,
} from './interface/interfaces';

/**
 * 有一些特殊的页面，不受权限控制，也不应该出现在搜索结果中
 */
const BLACKLIST = ['系统管理 > 系统集成 > 短信设置'];
/**
 * 有一些特殊的页面，不受权限控制，应该出现在所有权限角色的搜索结果中
 */
const WHITELIST = ['工作台 > 监控通知', '工作台 > 任务处理', '工作台 > 异常数据'];

/**
 * 遍历navigator树，输出扁平的、包含菜单元数据的map结构
 * 该方法只能遍历 NavigatorTreeNode<NavTreeNode> 的数据
 * NavigatorTreeNode的定义已最大程度降低数据耦合
 * 遍历结果不受菜单位置调整的影响
 * @param treeData navigator数据源
 * @param currentName 当前菜单节点在所处位置的名称（包含历史路径）
 * @param currentPath 当前菜单节点在所处位置的pathname
 * @param depth 当前菜单节点在整个树中的深度
 * @param dataMap 菜单元数据映射表
 * @returns navigator数据源处理后得到的dataMap
 */
export const traverseNavTree = (
  treeData: NavigatorTreeNode<NavTreeNode>,
  currentName = '',
  currentPath = '',
  depth = 0,
  dataMap: TreeDataMap = new Map()
): TreeDataMap => {
  treeData.forEach(node => {
    const { children: childTree, name, path, permissions } = node;
    const latestName = depth ? `${currentName} > ${name}` : name,
      latestPath = depth ? currentPath + (path.startsWith('/') ? path : `/${path}`) : path;
    /**过滤掉所有父级目录 */
    if ((!childTree?.length && !BLACKLIST.includes(latestName)) || WHITELIST.includes(latestName)) {
      dataMap.set(name, {
        depth,
        name: latestName,
        path: latestPath,
        permissions,
      });
    }
    if (childTree?.length) {
      traverseNavTree(childTree, latestName, latestPath, depth + 1, dataMap);
    }
  });

  return dataMap;
};

/**
 * 根据用户每次输入的结果，筛选符合条件的菜单元数据
 * @param navMap @see TreeDataMap
 * @returns 按深度排列筛选的结果
 */
export const iterateMaps = (navMap: TreeDataMap) => (keywords: string) => {
  /**当用户输入小写英文时，不需要进行计算 */
  const igoreWordsReg = new RegExp('^[a-z0-9]+$', 'g');
  const ignore = igoreWordsReg.test(keywords);
  /**不符合计算条件的操作，返回空数组 */
  if (!keywords || ignore) return [];
  /**根据搜索内容，按照深度排列符合条件的菜单元数据，实现显示结果优先级 */
  let candidates: any[] = [];
  for (const [_, menuInfo] of navMap) {
    const { depth, name } = menuInfo;
    if (name.indexOf(keywords) > -1) {
      if (!Array.isArray(candidates[depth])) {
        candidates[depth] = [];
      }
      candidates[depth].push(menuInfo);
    }
  }

  /**拍平candidates, 等同于candidates.flat() */
  while (candidates.some(Array.isArray)) {
    candidates = [].concat(...candidates).filter(uniq => uniq);
  }
  return candidates;
};

/**
 * 处理关键字高亮逻辑
 * @param name 符合条件菜单中，包含关键字的菜单路径全称。 @see MenuItemInfo.name
 * @param keywords 用户的输入
 * @returns
 */
export const decoratePathNameResolver = (name: string, keywords: string): DecoratedPathNameIndex => {
  const regexp = RegExp(keywords, 'g');
  const matches = name.matchAll(regexp);
  /**将字符匹配信息的索引进行保存 */
  const decoratedPathNameIndexes: DecoratedPathNameIndex = [];
  for (const match of matches) {
    decoratedPathNameIndexes.push(match.index as number);
  }
  return decoratedPathNameIndexes;
};
