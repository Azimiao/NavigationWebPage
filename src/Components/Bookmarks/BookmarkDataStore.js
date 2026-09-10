import { observable, runInAction } from 'mobx';
import Config from './Config';

const unwrap = (item) => item?.raw || item;

const toLink = (item) => ({
    id: item.id,
    type: 'link',
    title: item.name || item.title || '未命名书签',
    url: item.link || item.url || '#',
    logo: item.icon || item.icon_third || item.logo || '',
    iframe: Boolean(item.iframe && String(item.iframe).length),
    bookmarks: [],
});

const normalize = (payload) => {
    const categories = (payload.categories || []).map(unwrap);
    const bookmarks = (payload.bookmarks || []).map(unwrap);
    const folders = categories.map((category) => ({
        id: category.id,
        type: 'folder',
        title: category.name || category.title || '未命名分类',
        url: category.link || '#',
        logo: category.icon || '',
        iframe: false,
        bookmarks: bookmarks.filter((item) => (item.categories || []).includes(category.id)).map(toLink),
    })).filter((folder) => folder.bookmarks.length > 0);
    const topSites = bookmarks.filter((item) => !(item.categories || []).length).map(toLink);
    return [...folders, ...topSites];
};

const fetchJson = async (url) => {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Bookmark request failed: ${response.status}`);
    return response.json();
};

const BookmarkDataStore = observable({
    allBookMarks: [],
    isLoading: false,
    error: null,
    async requestData() {
        if (this.isLoading) return;
        this.isLoading = true;
        this.error = null;
        try {
            let payload;
            try {
                payload = await fetchJson(`${process.env.PUBLIC_URL || ''}/data.json`);
            } catch (localError) {
                if (Config.use_rest) {
                    const [categories, bookmarks] = await Promise.all([fetchJson(Config.taxonomy_rest), fetchJson(Config.bookmarks_rest)]);
                    payload = { categories, bookmarks };
                } else {
                    payload = await fetchJson(Config.ajaxUrl);
                }
            }
            runInAction(() => {
                this.allBookMarks = normalize(payload);
                this.isLoading = false;
            });
        } catch (error) {
            runInAction(() => {
                this.error = error;
                this.isLoading = false;
            });
        }
    },
});

export default BookmarkDataStore;
