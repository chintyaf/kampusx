import "bootstrap/dist/css/bootstrap.min.css";

const Button = ({ children, variant = "primary", ...props }) => {
    const variantStyle = {
        primary: "btn-primary",
        secondary: "btn-secondary",
        success: "btn-success",
        danger: "btn-danger",
        warning: "btn-warning",
        info: "btn-info",
        light: "btn-light",
        dark: "btn-dark",
    };

    return (
        <button
            className={`btn ${variantStyle[variant]} rounded-3 px-3 py-2 fw-semibold`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
