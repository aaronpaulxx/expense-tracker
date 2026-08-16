import { Fragment } from "react";
import PropTypes from "prop-types";
import { AlertCircle } from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  date,
  expenseCount,
}) => {
  const dayName = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-stone-900 p-6 text-left align-middle shadow-xl transition-all border border-stone-500">
                <Dialog.Title
                  as="h3"
                  className="text-xl font-semibold leading-6 text-white border-b border-stone-500 pb-3 mb-4 flex items-center gap-2"
                >
                  <AlertCircle size={35} className="text-red-500" /> Confirm
                  Deletion
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-stone-300">
                    Are you sure you want to delete all{" "}
                    <span className="font-semibold text-red-500 text-lg">
                      {expenseCount}
                    </span>{" "}
                    expenses for{" "}
                    <span className="font-semibold text-stone-200">
                      {dayName}
                    </span>
                    ? This action cannot be undone.
                  </p>
                </div>

                <div className="mt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    className="cursor-pointer inline-flex justify-center rounded-full border border-transparent bg-stone-700 px-4 py-2 text-sm font-normal text-stone-200 hover:bg-stone-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2 transition-colors duration-200"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="cursor-pointer inline-flex justify-center rounded-full border border-transparent bg-red-700 px-4 py-2 text-sm font-normal text-white hover:bg-red-500 active:bg-red-800 transition-colors duration-200"
                    onClick={onConfirm}
                  >
                    Confirm
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

DeleteConfirmationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  date: PropTypes.instanceOf(Date).isRequired,
  expenseCount: PropTypes.number,
};

export default DeleteConfirmationModal;
