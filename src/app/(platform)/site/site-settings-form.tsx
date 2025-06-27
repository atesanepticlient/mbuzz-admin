"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  useGetSiteSettingsQuery,
  useUpdateSiteSettingsMutation,
} from "@/lib/features/siteSettingsApi";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { INTERNAL_SERVER_ERROR } from "@/error";

// Define validation schema
const siteSettingsSchema = z.object({
  siteSettings: z.object({
    id: z.string().optional(),
    maxWithdraw: z.coerce.number().min(0, "Must be positive").optional(),
    minWithdraw: z.coerce.number().min(0, "Must be positive").optional(),
    dpTurnover: z.coerce.number().min(0, "Must be positive").optional(),
  }),
  bonusSettings: z.object({
    id: z.string().optional(),
    signinBonus: z.coerce.number().int().min(0, "Must be positive"),
    referralBonus: z.coerce.number().int().min(0, "Must be positive"),
  }),
});

export type SiteSettingsFormValues = z.infer<typeof siteSettingsSchema>;

export function SiteSettingsForm() {
  const { data, isLoading: isFetching } = useGetSiteSettingsQuery({});
  const [updateSettings, { isLoading: isUpdating }] =
    useUpdateSiteSettingsMutation();

  const form = useForm<SiteSettingsFormValues>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: {
      siteSettings: {
        maxWithdraw: 0,
        minWithdraw: 0,
        dpTurnover: 0,
      },
      bonusSettings: {
        signinBonus: 5,
        referralBonus: 5,
      },
    },
    values: data || undefined,
  });

  const onSubmit = async (values: SiteSettingsFormValues) => {
    const asyncAction = async () => {
      await updateSettings(values).unwrap();
    };

    toast.promise(asyncAction(), {
      loading: "Updating...",
      success: () => "Setting updated",
      error: (error) => {
        if (error?.data?.error) {
          return `Error: ${error.data.error}`;
        } else {
          return INTERNAL_SERVER_ERROR;
        }
      },
    });
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Site Settings Section */}
          <div className="space-y-4 p-6 border rounded-lg">
            <h3 className="text-lg font-medium">Withdrawal Settings</h3>

            <FormField
              control={form.control}
              name="siteSettings.maxWithdraw"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Withdrawal</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="siteSettings.minWithdraw"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Withdrawal</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="siteSettings.dpTurnover"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deposit Turnover [X]</FormLabel>
                  <FormControl>
                    <Input type="number" max={5} step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Bonus Settings Section */}
          <div className="space-y-4 p-6 border rounded-lg">
            <h3 className="text-lg font-medium">Bonus Settings</h3>

            <FormField
              control={form.control}
              name="bonusSettings.signinBonus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sign-in Bonus</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bonusSettings.referralBonus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referral Bonus</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button type="submit" variant={"primary"} disabled={isUpdating}>
          {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Settings
        </Button>
      </form>
    </Form>
  );
}
