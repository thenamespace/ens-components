
import { EnsRecords } from "../../types"
import "./SelectRecordsForm.css"

const NAV_TEXTS = "Text Records"
const NAV_ADDRS = "Address Records"
const WEBSITE = "Website";

const navigation_items: string[] = [
    NAV_TEXTS,
    NAV_ADDRS,
    WEBSITE
]

export interface SelectRecordsFormProps {
    records: EnsRecords
    onRecordsUpdated: (records: EnsRecords) => void
}

export const SelectRecordsForm = ({
    records,
    onRecordsUpdated
}: SelectRecordsFormProps) => {
    return <div className="ns-select-records-form">

        {/* // cover and avatar */}
        <div className="ns-cover-cont">
            <div className="ns-avatar-cont">

            </div>
        </div>

        <div className="ns-select-records-content">

        </div>
    </div>
}