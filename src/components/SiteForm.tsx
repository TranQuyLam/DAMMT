import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Site } from "@/types/site";
import { Button } from "@/components/ui/button";

const schema = z.object({
  site_id: z
    .string()
    .min(1, "Bắt buộc")
    .regex(/^[a-z0-9_]+$/, "Chỉ chữ thường, số, dấu _"),
  name: z.string().min(1, "Bắt buộc"),
  target_url: z.string().url("URL không hợp lệ"),
  path_prefix: z
    .string()
    .refine((v) => v === "" || v.startsWith("/"), "Phải bắt đầu bằng /"),
  host: z.string(),
  port: z
    .string()
    .refine(
      (v) => v === "" || (/^\d+$/.test(v) && Number(v) >= 1 && Number(v) <= 65535),
      "Port phải từ 1 đến 65535"
    ),
  assigned_scripts: z.string(),
  auth_required: z.boolean(),
  active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  initial?: Site;
  onSubmit: (site: Site) => void;
  onCancel: () => void;
}

const inputCls = "w-full rounded-md border px-3 py-2 text-sm";

export default function SiteForm({ initial, onSubmit, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      site_id: initial?.site_id ?? "",
      name: initial?.name ?? "",
      target_url: initial?.target_url ?? "https://",
      path_prefix: initial?.path_prefix ?? "",
      host: initial?.host ?? "",
      port: initial?.port ? String(initial.port) : "",
      assigned_scripts: initial?.assigned_scripts.join(", ") ?? "",
      auth_required: initial?.auth_required ?? true,
      active: initial ? initial.status === "active" : true,
    },
  });

  const submit = (v: FormValues) => {
    const now = new Date().toISOString();
    onSubmit({
      site_id: v.site_id,
      name: v.name,
      target_url: v.target_url,
      path_prefix: v.path_prefix || undefined,
      host: v.host || undefined,
      port: v.port ? Number(v.port) : undefined,
      auth_required: v.auth_required,
      assigned_scripts: v.assigned_scripts
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      status: v.active ? "active" : "inactive",
      created_at: initial?.created_at ?? now,
      updated_at: now,
    });
  };

  const err = (msg?: string) =>
    msg ? <p className="text-xs text-red-600">{msg}</p> : null;

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-3">
      <div>
        <label className="mb-1 block text-sm font-medium">Site ID</label>
        <input className={inputCls} disabled={!!initial} {...register("site_id")} />
        {err(errors.site_id?.message)}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Tên</label>
        <input className={inputCls} {...register("name")} />
        {err(errors.name?.message)}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Target URL</label>
        <input className={inputCls} {...register("target_url")} />
        {err(errors.target_url?.message)}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Path prefix</label>
        <input className={inputCls} placeholder="/google" {...register("path_prefix")} />
        {err(errors.path_prefix?.message)}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Host</label>
          <input
            className={inputCls}
            placeholder="google.proxy.local"
            {...register("host")}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Port</label>
          <input className={inputCls} placeholder="8080" {...register("port")} />
          {err(errors.port?.message)}
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">
          Scripts gán cho site (cách nhau bằng dấu phẩy)
        </label>
        <input
          className={inputCls}
          placeholder="modify_google.py, add_banner.js"
          {...register("assigned_scripts")}
        />
      </div>
      <div className="flex gap-6 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register("auth_required")} /> Yêu cầu đăng nhập
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register("active")} /> Đang hoạt động
        </label>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit">Lưu</Button>
      </div>
    </form>
  );
}