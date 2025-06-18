/**
 * Props for the ConfirmPolygonButton component.
 */
export interface ConfirmPolygonButtonProps {
    /**
     * Callback function triggered when the user clicks the "Set" button to confirm the polygon.
     */
    onConfirm: () => void;
}

/**
 * A simple confirmation button that allows users to confirm a polygon action
 * (e.g. after drawing or editing). It displays an icon and the label "Set".
 *
 * This component is currently used inside a MapLibre popup.
 *
 * @param {ConfirmPolygonButtonProps} props - Component props.
 * @returns {JSX.Element} The rendered confirmation button.
 */
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
            <img
                src="/icons/confirm-polygon.svg"
                alt="Set polygon"
                width={24}
                height={24}
            />
            Set
        </button>
    );
};

export default ConfirmPolygonButton;
