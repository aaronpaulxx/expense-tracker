import { Fragment } from "react";
import PropTypes from "prop-types";
import { AlertCircle } from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";
import { pluralize } from "../lib/toast";

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
          <div className="fixed inset-0 bg-white/20 backdrop-blur-xs" />
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-card p-5 text-left align-middle shadow-xl transition-all border border-transparent">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-semibold leading-6 text-foreground border-b border-border pb-3 mb-2 flex items-center gap-2"
                >
                  <AlertCircle size={28} className="text-destructive" /> Delete
                  List
                </Dialog.Title>
                <div className="mb-5">
                  <p className="text-sm text-muted-foreground">
                    Are you sure you want to delete all{" "}
                    <span className="font-semibold text-destructive text-lg">
                      {expenseCount.toLocaleString()}
                    </span>{" "}
                    {pluralize(expenseCount, "expense")} for{" "}
                    <span className="font-semibold text-foreground">
                      {dayName}?
                    </span>
                    <span className="mt-2 block text-destructive">
                      This action cannot be undone.
                    </span>
                  </p>
                </div>

                <div className="mt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    className="cursor-pointer inline-flex justify-center rounded-full border border-transparent bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-border focus-visible:ring-offset-2 transition-colors duration-200"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="cursor-pointer inline-flex justify-center rounded-full border border-transparent bg-destructive px-4 py-2 text-sm font-medium text-white hover:bg-destructive/80 active:bg-destructive/60 transition-colors duration-200"
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
