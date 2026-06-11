export type ImportListItem = {
    id: number;
};

export type FlareSolverrResponse = {
    status: string;
    message: string;
    solution: {
        status: number;
        response: string;
    };
};
