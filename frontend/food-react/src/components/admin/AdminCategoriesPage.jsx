import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../services/ApiService";
import { useError } from "../common/ErrorDisplay";

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);

  const { ErrorDisplay, showError } = useError();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await ApiService.getAllCategories();

      // expecting: { statusCode, message, data: [...] }
      if (response?.statusCode === 200) {
        setCategories(response.data || []);
      } else {
        showError(response?.message || "Failed to fetch categories");
      }
    } catch (error) {
      showError(error.response?.data?.message || error.message);
    }
  };

  const handleAddCategory = () => {
    navigate("/admin/categories/new");
  };

  const handleEditCategory = (id) => {
    navigate(`/admin/categories/edit/${id}`);
  };

  const handleDeleteCategory = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this category?");
    if (!ok) return;

    try {
      const response = await ApiService.deleteCategory(id);

      if (response?.statusCode === 200) {
        fetchCategories();
      } else {
        showError(response?.message || "Failed to delete category");
      }
    } catch (error) {
      showError(error.response?.data?.message || error.message);
    }
  };

  return (
    <>
      {/* CSS INSIDE SAME FILE */}
      <style>{`
        .admin-categories {
          padding: 24px;
        }

        .content-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }

        .content-header h1 {
          font-size: 24px;
          font-weight: 700;
          margin: 0;
        }

        .add-btn {
          background: #ff7a00;
          color: #fff;
          border: none;
          padding: 10px 14px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }

        .add-btn:hover {
          opacity: 0.92;
        }

        .categories-table {
          background: #fff;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid #e7e7e7;
        }

        .categories-table table {
          width: 100%;
          border-collapse: collapse;
        }

        .categories-table thead {
          background: #f7f7f7;
        }

        .categories-table th,
        .categories-table td {
          text-align: left;
          padding: 14px 14px;
          border-bottom: 1px solid #eee;
          font-size: 14px;
          vertical-align: middle;
        }

        .name-cell {
          font-weight: 600;
        }

        .desc-cell {
          color: #444;
        }

        .actions {
          display: flex;
          gap: 10px;
        }

        .edit-btn {
          background: #2ecc71;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }

        .edit-btn:hover {
          opacity: 0.92;
        }

        .delete-btn {
          background: #e74c3c;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }

        .delete-btn:hover {
          opacity: 0.92;
        }

        .empty-row {
          text-align: center;
          padding: 30px !important;
          color: #666;
        }
      `}</style>

      <div className="admin-categories">
        <ErrorDisplay />

        <div className="content-header">
          <h1>Categories Management</h1>

          <button className="add-btn" onClick={handleAddCategory}>
            + Add Category
          </button>
        </div>

        <div className="categories-table">
          <table>
            <thead>
              <tr>
                <th style={{ width: "80px" }}>ID</th>
                <th style={{ width: "260px" }}>Name</th>
                <th>Description</th>
                <th style={{ width: "220px" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="4" className="empty-row">
                    No categories found.
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id}>
                    <td>{category.id}</td>
                    <td className="name-cell">{category.name}</td>
                    <td className="desc-cell">{category.description || "-"}</td>

                    <td className="actions">
                      <button
                        className="edit-btn"
                        onClick={() => handleEditCategory(category.id)}
                      >
                        Edit
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default AdminCategoriesPage;