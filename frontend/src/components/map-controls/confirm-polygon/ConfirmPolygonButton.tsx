export interface ConfirmPolygonButtonProps {
    onConfirm: () => void;
}

const ConfirmPolygonButton = ({ onConfirm }: ConfirmPolygonButtonProps) => {
    const handleClick = () => {
        onConfirm();
    };

    return (
        <button
            onClick={handleClick}
            style={{
                background: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
            }}
        >
            <img src="/icons/confirm-polygon.svg" alt="Set polygon" width={24} height={24} />
            Set
        </button>
    );
};

export default ConfirmPolygonButton;
