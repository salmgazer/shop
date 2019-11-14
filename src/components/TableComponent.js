import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { withStyles } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
import Paper from '@material-ui/core/Paper';
import { AutoSizer, Column, Table } from 'react-virtualized';

const styles = theme => ({
	flexContainer: {
		display: 'flex',
		alignItems: 'center',
		boxSizing: 'border-box',
	},
	table: {
		// temporary right-to-left patch, waiting for
		// https://github.com/bvaughn/react-virtualized/issues/454
		'& .ReactVirtualized__Table__headerRow': {
			flip: false,
			paddingRight: theme.direction === 'rtl' ? '0px !important' : undefined,
		},
	},
	tableRow: {
		cursor: 'pointer',
	},
	tableRowHover: {
		'&:hover': {
			backgroundColor: theme.palette.grey[200],
		},
	},
	tableCell: {
		flex: 1,
	},
	noClick: {
		cursor: 'initial',
	},
});

class MuiVirtualizedTable extends React.PureComponent {
	static defaultProps = {
		headerHeight: 48,
		rowHeight: 48,
	};

	getRowClassName = ({ index }) => {
		const { classes, onRowClick } = this.props;

		return clsx(classes.tableRow, classes.flexContainer, {
			[classes.tableRowHover]: index !== -1 && onRowClick != null,
		});
	};

	cellRenderer = ({ cellData, columnIndex }) => {

		let value = cellData;
		if (value instanceof Date) {
			value = value.toLocaleString().split(',')[0].toString();
		}

		const { columns, classes, rowHeight, onRowClick, EditComponent, CreateComponent } = this.props;
		console.log("$$$$$$$$$$$$$$$$$$$");
		console.log(EditComponent);
		console.log("$$$$$$$$$$$$$$$$$$$");
		return (
			<TableCell
				component="div"
				className={clsx(classes.tableCell, classes.flexContainer, {
					[classes.noClick]: onRowClick == null,
				})}
				variant="body"
				style={{ height: rowHeight }}
				align={(columnIndex != null && columns[columnIndex].numeric) || false ? 'right' : 'left'}
			>
				{
					columns[columnIndex].dataKey !== 'actions' ? value :
						<div>
							<EditComponent />
							<CreateComponent />
						</div>
				}
			</TableCell>
		);
	};

	headerRenderer = ({ label, columnIndex }) => {
		const { headerHeight, columns, classes } = this.props;

		return (
			<TableCell
				component="div"
				className={clsx(classes.tableCell, classes.flexContainer, classes.noClick)}
				variant="head"
				style={{ height: headerHeight }}
				align={columns[columnIndex].numeric || false ? 'right' : 'left'}
			>
				<span>{label}</span>
			</TableCell>
		);
	};

	render() {
		const { classes, columns, rowHeight, headerHeight, ...tableProps } = this.props;
		return (
			<AutoSizer>
				{({ height, width }) => (
					<Table
						height={height}
						width={width}
						rowHeight={rowHeight}
						gridStyle={{
							direction: 'inherit',
						}}
						headerHeight={headerHeight}
						className={classes.table}
						{...tableProps}
						rowClassName={this.getRowClassName}
					>
						{columns.map(({ dataKey, ...other }, index) => {
							return (
								<Column
									key={dataKey}
									headerRenderer={headerProps =>
										this.headerRenderer({
											...headerProps,
											columnIndex: index,
										})
									}
									className={classes.flexContainer}
									cellRenderer={this.cellRenderer}
									dataKey={dataKey}
									{...other}
								/>
							);
						})}
					</Table>
				)}
			</AutoSizer>
		);
	}
}

MuiVirtualizedTable.propTypes = {
	classes: PropTypes.object.isRequired,
	columns: PropTypes.arrayOf(
		PropTypes.shape({
			dataKey: PropTypes.string.isRequired,
			label: PropTypes.string.isRequired,
			numeric: PropTypes.bool,
			width: PropTypes.number.isRequired,
		}),
	).isRequired,
	headerHeight: PropTypes.number,
	onRowClick: PropTypes.func,
	rowHeight: PropTypes.number,
};

const VirtualizedTable = withStyles(styles)(MuiVirtualizedTable);

// ---
/*
const sample = [
	['Frozen yoghurt', 159, 6.0, 24, 4.0],
	['Ice cream sandwich', 237, 9.0, 37, 4.3],
	['Eclair', 262, 16.0, 24, 6.0],
	['Cupcake', 305, 3.7, 67, 4.3],
	['Gingerbread', 356, 16.0, 49, 3.9],
];

function createData(id, dessert, calories, fat, carbs, protein) {
	return { id, dessert, calories, fat, carbs, protein };
}

const rows = [];

for (let i = 0; i < 200; i += 1) {
	const randomSelection = sample[Math.floor(Math.random() * sample.length)];
	rows.push(createData(i, ...randomSelection));
}
*/

export default function TableComponent(props) {
	const {fieldNames, entries, EditComponent, CreateComponent} = props;

	const columns = fieldNames.map( fieldName => {
		const field = fieldName;
		field.dataKey = fieldName.name;
		field.numeric = fieldName.type === 'number';
		field.width = fieldName.width || 200;
		// delete field.name;
		// delete field.type;
		return field;
	});

	columns.push({ dataKey: 'actions', label: 'Actions', width: 150 });

	console.log(entries);
	console.log(columns);

	return (
		<Paper style={{ height: 400, width: '100%' }}>
			<VirtualizedTable
				EditComponent={EditComponent}
				CreateComponent={CreateComponent}
				rowCount={entries.length}
				rowGetter={({ index }) => entries[index]}
				columns={columns}
			/>
		</Paper>
	);
}
