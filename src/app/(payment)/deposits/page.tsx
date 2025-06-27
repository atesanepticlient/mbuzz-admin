/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import moment from "moment";
import { format } from "date-fns";
import {
  useApprovalDepositMutation,
  useFetchDepostsQuery,
} from "@/lib/features/paymentApiSlice";
import { ExtenedDeposit } from "@/type/payment";
import CookieLoader from "@/components/loaders/cookie-loader";
import { DepositStatus } from "@prisma/client";
import { TableSkeletonLoader } from "@/components/loaders/table-loader";
import { toast } from "sonner";
import { INTERNAL_SERVER_ERROR } from "@/error";

const Deposits: React.FC = () => {
  const [filter, setFilter] = useState({
    gateway: "",
    from: "",
    to: "",
    limit: 10,
    maxAmount: 25000,
    minAmount: 0,
    search: "",
    status: "ALL",
    page: 1,
  });

  const { data, isLoading, isFetching } = useFetchDepostsQuery(filter);
  const deposits = data?.data.deposits;
  const totalFound = data?.data.totalFound;
  const paymentWallets = data?.data.paymentWallets;

  const [arrovalAPi, { isLoading: arrovalActionLoading }] =
    useApprovalDepositMutation();

  const handleArroval = (
    depositId: string,
    actionType: "reject" | "approve"
  ) => {
    const asyncAction = async () => {
      const response = await arrovalAPi({
        actionType,
        depositId,
        message: message,
      }).unwrap();
      return response.success;
    };

    toast.promise(asyncAction(), {
      loading: "Updating...",
      success: () => (actionType == "approve" ? "Approved" : "Rejected"),
      error: (error: any) => {
        if (error?.data?.error) {
          return `Error: ${error.data.error}`;
        } else {
          return INTERNAL_SERVER_ERROR;
        }
      },
    });
  };

  const handleChangeFilterValues = (name: string, value: any) => {
    setFilter((state) => ({ ...state, [name]: value }));
  };

  const [activeTab, setActiveTab] = useState("recent");
  const [selectedDeposit, setSelectedDeposit] = useState<ExtenedDeposit | null>(
    null
  );
  const [message, setMessage] = useState(
    "Your Deposit was successfully added "
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleViewDetails = (deposit: ExtenedDeposit) => {
    setSelectedDeposit(deposit);
    setIsModalOpen(true);
  };

  const renderStatusBadge = (status: DepositStatus) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>
        );
      case "APPROVED":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">Approved</Badge>
        );
      case "REJECTED":
        return <Badge className="bg-red-500 hover:bg-red-600">Rejected</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  useEffect(() => {
    if (dateRange.from && dateRange.to) {
      handleChangeFilterValues("from", dateRange.from);
      handleChangeFilterValues("to", dateRange.to);
    }
  }, [dateRange]);

  useEffect(() => {
    if (activeTab == "recent" && filter.status !== "ALL") {
      handleChangeFilterValues("status", "ALL");
    } else if (activeTab == "approved" && filter.status !== "ARROVED") {
      handleChangeFilterValues("status", "APPROVED");
    } else if (activeTab == "rejected" && filter.status !== "REJECTED") {
      handleChangeFilterValues("status", "REJECTED");
    }
  }, [activeTab]);

  const renderTableContent = () => {
    if (isFetching) return <TableSkeletonLoader />;
    return (
      <>
        <div className="overflow-x-auto border rounded-md">
          <Table className="  ">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px] ">TRX ID</TableHead>
                <TableHead>Tracking ID</TableHead>
                <TableHead>Player ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Gateway</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deposits?.map((deposit) => (
                <TableRow key={deposit.id} className="">
                  <TableCell className="font-medium ">
                    {deposit.trxID}
                  </TableCell>
                  <TableCell>{deposit.trackingNumber}</TableCell>
                  <TableCell>{deposit.user.playerId}</TableCell>
                  <TableCell>৳{+deposit.amount}</TableCell>
                  <TableCell>
                    <div className="flex items-center capitalize">
                      <img
                        src={deposit.wallet.paymentWallet.walletLogo}
                        alt={deposit.wallet.paymentWallet.walletName}
                        className="w-[50px] mr-2"
                      />
                      {deposit.wallet.paymentWallet.walletName}
                    </div>
                  </TableCell>
                  <TableCell>{moment(deposit.createdAt).calendar()}</TableCell>
                  <TableCell>{renderStatusBadge(deposit.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(deposit)}
                      className="!rounded-button whitespace-nowrap cursor-pointer"
                    >
                      <i className="fas fa-eye mr-1"></i> View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {deposits?.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-gray-500"
                  >
                    No deposits found matching your filters
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="px-6 py-4 flex items-center justify-between ">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">{deposits?.length || 0}</span>{" "}
            of <span className="font-medium">{totalFound}</span> deposits
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={deposits?.length == 0 || filter.page == 1}
              onClick={() => handleChangeFilterValues("page", filter.page - 1)}
              className="!rounded-button whitespace-nowrap cursor-pointer"
            >
              <i className="fas fa-chevron-left mr-1"></i> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={
                deposits?.length == 0 ||
                Math.ceil(totalFound! / filter.limit) == filter.page
              }
              onClick={() => handleChangeFilterValues("page", filter.page + 1)}
              className="!rounded-button whitespace-nowrap cursor-pointer"
            >
              Next <i className="fas fa-chevron-right ml-1"></i>
            </Button>
          </div>
        </div>
      </>
    );
  };
  return (
    <>
      {deposits && !isLoading && (
        <div className="">
          <main className="max-w-7xl mx-auto">
            {/* Tabs and Data */}
            <div className=" shadow rounded-lg overflow-hidden">
              <Tabs defaultValue="recent" onValueChange={setActiveTab}>
                <div className=" pt-6">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger
                      value="recent"
                      className="!rounded-button whitespace-nowrap cursor-pointer"
                    >
                      Recent Deposits
                    </TabsTrigger>
                    <TabsTrigger
                      value="approved"
                      className="!rounded-button whitespace-nowrap cursor-pointer"
                    >
                      Approved Deposits
                    </TabsTrigger>
                    <TabsTrigger
                      value="rejected"
                      className="!rounded-button whitespace-nowrap cursor-pointer"
                    >
                      Rejected Deposits
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Filters */}
                <div className=" py-4  ">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="search" className="text-sm font-medium">
                        Search
                      </Label>
                      <div className="relative mt-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <i className="fas fa-search text-gray-400"></i>
                        </div>
                        <Input
                          id="search"
                          type="text"
                          placeholder="TRX ID, User ID..."
                          className="pl-10"
                          value={filter.search}
                          onChange={(e) =>
                            handleChangeFilterValues("search", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <Label
                        htmlFor="date-range"
                        className="text-sm font-medium"
                      >
                        Date Range
                      </Label>
                      <Popover
                        open={isCalendarOpen}
                        onOpenChange={setIsCalendarOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            id="date-range"
                            variant="outline"
                            className="w-full justify-start text-left font-normal mt-1 !rounded-button whitespace-nowrap cursor-pointer"
                          >
                            <i className="fas fa-calendar-alt mr-2 text-gray-400"></i>
                            {dateRange.from ? (
                              dateRange.to ? (
                                <>
                                  {format(dateRange.from, "LLL dd, y")} -{" "}
                                  {format(dateRange.to, "LLL dd, y")}
                                </>
                              ) : (
                                format(dateRange.from, "LLL dd, y")
                              )
                            ) : (
                              <span>Pick a date range</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="range"
                            selected={dateRange}
                            onSelect={(range) => {
                              setDateRange(
                                range as {
                                  from: Date | undefined;
                                  to: Date | undefined;
                                }
                              );
                              if (range?.to) setIsCalendarOpen(false);
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <Label
                        htmlFor="payment-gateway"
                        className="text-sm font-medium"
                      >
                        Payment Gateway
                      </Label>
                      <Select
                        value={filter.gateway}
                        onValueChange={(value) =>
                          handleChangeFilterValues("gateway", value)
                        }
                      >
                        <SelectTrigger id="payment-gateway" className="mt-1">
                          <SelectValue placeholder="All Gateways" />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentWallets?.map((pw, i) => (
                            <SelectItem
                              value={pw.walletName}
                              key={i}
                              className="capitalize"
                            >
                              {pw.walletName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label
                        htmlFor="amount-range"
                        className="text-sm font-medium"
                      >
                        Amount Range
                      </Label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <Input
                          id="min-amount"
                          type="number"
                          placeholder="Min"
                          value={filter.minAmount}
                          onChange={(e) =>
                            handleChangeFilterValues(
                              "minAmount",
                              +e.target.value
                            )
                          }
                          className="text-sm"
                        />
                        <Input
                          id="max-amount"
                          type="number"
                          placeholder="Max"
                          value={filter.maxAmount}
                          onChange={(e) =>
                            handleChangeFilterValues(
                              "maxAmount",
                              +e.target.value
                            )
                          }
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <TabsContent value="recent" className="p-0">
                  {renderTableContent()}
                </TabsContent>

                <TabsContent value="approved" className="p-0">
                  {renderTableContent()}
                </TabsContent>

                <TabsContent value="rejected" className="p-0">
                  {renderTableContent()}
                </TabsContent>
              </Tabs>
            </div>
          </main>

          {/* Deposit Details Modal */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="sm:max-w-[700px]">
              <DialogHeader>
                <DialogTitle>Deposit Details</DialogTitle>
                <DialogDescription>
                  Transaction ID: {selectedDeposit?.trxID}
                </DialogDescription>
              </DialogHeader>

              {selectedDeposit && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">
                        Transaction Information
                      </h3>
                      <div className=" p-4 rounded-lg space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            Transaction ID:
                          </span>
                          <span className="text-sm font-medium">
                            {selectedDeposit.trxID}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            Tracking ID:
                          </span>
                          <span className="text-sm font-medium">
                            {selectedDeposit.trackingNumber}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Amount:</span>
                          <span className="text-sm font-medium">
                            ৳{+selectedDeposit.amount}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Status:</span>
                          <span>
                            {renderStatusBadge(selectedDeposit.status)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            Timestamp:
                          </span>
                          <span className="text-sm font-medium">
                            {moment(selectedDeposit.createdAt).calendar()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">
                        Payment Information
                      </h3>
                      <div className=" p-4 rounded-lg space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            Payment Method:
                          </span>
                          <span className="text-sm font-medium">
                            {selectedDeposit.wallet.paymentWallet.walletName}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            Account Details:
                          </span>
                          <span className="text-sm font-medium">
                            {selectedDeposit.walletNumber}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            Sender Account Number:
                          </span>
                          <span className="text-sm font-medium">
                            {selectedDeposit.senderNumber}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">
                        User Information
                      </h3>
                      <div className=" p-4 rounded-lg space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            User ID:
                          </span>
                          <span className="text-sm font-medium">
                            {selectedDeposit.userId}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            Player Id:
                          </span>
                          <span className="text-sm font-medium">
                            {selectedDeposit.user.playerId}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Email:</span>
                          <span className="text-sm font-medium">****</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Phone:</span>
                          <span className="text-sm font-medium">
                            {selectedDeposit.user.phone}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">
                        Notes
                      </h3>
                      <div className="p-4 rounded-lg bg-input/30">
                        <p className="text-sm">Deposits</p>
                      </div>
                    </div>

                    {selectedDeposit.status === "PENDING" && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">
                          Message to User
                        </h3>
                        <Textarea
                          disabled={arrovalActionLoading}
                          placeholder="Enter a message to the user about this deposit..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className="resize-none"
                          rows={4}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
                {selectedDeposit?.status === "PENDING" ? (
                  <>
                    <Button
                      disabled={arrovalActionLoading}
                      variant="destructive"
                      onClick={() =>
                        handleArroval(selectedDeposit.id, "reject")
                      }
                      className="!rounded-button whitespace-nowrap cursor-pointer"
                    >
                      <i className="fas fa-times-circle mr-2"></i>
                      Reject Deposit
                    </Button>
                    <Button
                      disabled={arrovalActionLoading}
                      onClick={() =>
                        handleArroval(selectedDeposit.id, "approve")
                      }
                      className="bg-green-600 hover:bg-green-700 text-white !rounded-button whitespace-nowrap cursor-pointer"
                    >
                      <i className="fas fa-check-circle mr-2"></i>
                      Approve Deposit
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="ml-auto !rounded-button whitespace-nowrap cursor-pointer"
                  >
                    Close
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {(!deposits || isLoading) && (
        <div className="flex w-full h-[85vh] justify-center items-center">
          <CookieLoader />
        </div>
      )}
    </>
  );
};

export default Deposits;
