interface LoadingSpinnerProps {
    'data-oid'?: string;
    [key: string]: any;
}

export function LoadingSpinner(props: LoadingSpinnerProps) {
    return (
        <div className="flex items-center justify-center p-8" {...props}>
            <div
                data-testid="loading-spinner"
                className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
            ></div>
        </div>
    );
}
