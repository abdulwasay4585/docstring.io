const Footer = () => {
    return (
        <footer className="w-full py-6 mt-auto text-center z-50 relative bg-transparent">
            <div className="text-slate-400 text-sm">
                <p>&copy; {new Date().getFullYear()} Docstring.io All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
