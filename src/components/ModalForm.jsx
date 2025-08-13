import React, { useEffect, useState, useRef } from "react";

export default function ModalForm({ isOpen, onClose, onSubmit, fields, title }) {
    const [formData, setFormData] = useState({});
    const menuRef = useRef()
    useEffect(() => {
        const initialData = {};
        fields.forEach(field => {
            initialData[field.name] = field.defaultValue || "";
        });
        setFormData(initialData);
    }, [fields]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
                setFormData({});
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);


    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
                <h2 className="text-xl font-semibold mb-4">{title || "Modal Form"}</h2>
                <form ref={menuRef} onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {fields.map((field) => {
                        if (field.type === "textarea") {
                            return (
                                <div key={field.name} className={field.fullWidth ? "md:col-span-2" : ""}>
                                    <label required className="text-sm font-medium">{field.label}</label>
                                    <textarea
                                        name={field.name}
                                        rows={field.rows || 3}
                                        placeholder={field.placeholder}
                                        value={formData[field.name]}
                                        onChange={handleChange}
                                        required
                                        className="w-full mt-1 p-2 border border-gray-300 rounded"
                                    />
                                </div>
                            );
                        }

                        if (field.type === "select") {
                            return (
                                <div key={field.name} className={field.fullWidth ? "md:col-span-2" : ""}>
                                    <label className={`text-sm font-medium ${field.fullWidth ? "md:col-span-2" : ""}`}>{field.label}</label>
                                    <select
                                        name={field.name}
                                        value={formData[field.name]}
                                        onChange={handleChange}
                                        required
                                        className="w-full mt-1 p-2 border border-gray-300 rounded"
                                    >
                                        <option value="">Select</option>
                                        {field.options.map((opt, index) => (
                                            <option key={index} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}

                                    </select>
                                </div>
                            );
                        }

                        return (
                              <div key={field.name} className={field.fullWidth ? "md:col-span-2" : ""}>
                                <label className={`text-sm font-medium `}>{field.label}</label>
                                <input
                                    type={field.type}
                                    name={field.name}
                                    placeholder={field.placeholder}
                                    value={formData[field.name]}
                                    onChange={handleChange}
                                    disabled={field.disabled}
                                    required
                                    className={`w-full mt-1 p-2 border border-gray-300 rounded ${field.disabled ? "bg-gray-100" : ""}`}
                                />
                            </div>
                        );
                    })}

                    <div className="md:col-span-2 flex justify-end mt-4 gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
