export type MenuName = string;

export type DecoratedPathNameIndex = number[];

export type Permission = string;

export type NavTreeNode = {
  children?: NavTreeNode[];
  name: string;
  path: string;
  permissions: Permission[];
};

export type NavigatorTreeNode<T> = T[];

export type TreeDataMap = Map<MenuName, MenuItemInfo>;

export interface MenuItemInfo {
  /**
   * 包含关键字的菜单路径全称
   */
  name: string;
  /**
   * 菜单对应的url
   */
  path: string;
  /**
   * 菜单的嵌套深度，用于搜索算法优先级
   */
  depth: number;
  /**
   * 菜单权限
   */
  permissions?: Permission[];
}
