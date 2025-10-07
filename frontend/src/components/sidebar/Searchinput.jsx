import { useState } from "react";
import { IoSearchSharp } from "react-icons/io5";
import useConversation from "../../zustand/useConversation";
import toast from "react-hot-toast";

const SearchInput = () => {
  const [search, setSearch] = useState("");
  const { searchConversation } = useConversation();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!search) return;

    if (search.length < 3) {
      return toast.error("Search query must be at least 3 characters long.");
    }

    searchConversation(search); // Perform the search using store
  };

  const handleChange = (e) => {
    setSearch(e.target.value);
    handleSubmit(e);
   }
  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        placeholder="Search..."
        className="input input-bordered rounded-full"
        value={search}
        onChange={handleChange}
      />
      <button type="submit" className="btn btn-circle bg-sky-500 text-white">
        <IoSearchSharp className="w-6 h-6 outline-none" />
      </button>
    </form>
  );
};

export default SearchInput;
