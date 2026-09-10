/**
 * url 配置
 * ajaxUrl: 注册的 admin-ajax.php
 * xx_rest: 基于 wp rest api 的接口(注意：默认情况下 wp 最多返回 100 条，如果超过 100，需要处理分页或通过 hook 增加返回条数)
 */
export default {
    "ajaxUrl":"https://www.azimiao.com/wp-admin/admin-ajax.php?action=get_meow_bookmarks",
    "use_rest":false,
    "taxonomy_rest":"https://www.azimiao.com/wp-json/wp/v2/meow_bookmark_taxonomy?order=asc&per_page=100",
    "bookmarks_rest": "https://www.azimiao.com/wp-json/wp/v2/meow_bookmark?orderby=menu_order&order=asc&per_page=100",
};