
export interface SideNavigatorData {
    id: number;
    text: string;
    children: [SideNavigatorData];
    meta: {
        status: string
    };
};

export interface SideNavigator {
    title: string;
    items: [SideNavigatorData];
};

